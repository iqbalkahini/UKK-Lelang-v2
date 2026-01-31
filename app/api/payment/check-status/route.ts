import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";

// Initialize Core API
const core = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || ""
});

export async function POST(req: NextRequest) {
    try {
        const { order_id } = await req.json();

        if (!order_id) {
            return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
        }

        // 1. Get Transaction Status from Midtrans
        const statusResponse = await (core as any).transaction.status(order_id);

        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Manual Status Check. Order ID: ${order_id}. Status: ${transactionStatus}`);

        const supabase = await createClient();

        // Determine status (same logic as notification)
        let newStatus = 'pending';
        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                newStatus = 'challenge';
            } else if (fraudStatus == 'accept') {
                newStatus = 'settlement';
            }
        } else if (transactionStatus == 'settlement') {
            newStatus = 'settlement';
        } else if (transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire') {
            newStatus = 'failure';
        } else if (transactionStatus == 'pending') {
            newStatus = 'pending';
        }

        // 2. Check if status in DB is already same
        const { data: currentRecord } = await supabase
            .from('tb_topup')
            .select('status')
            .eq('id', order_id)
            .single();

        if (currentRecord && currentRecord.status === newStatus) {
            return NextResponse.json({ message: "Status already updated", status: newStatus });
        }

        // 3. Update tb_topup
        const { data: topupData, error: updateError } = await supabase
            .from('tb_topup')
            .update({ status: newStatus })
            .eq('id', order_id)
            .select()
            .single();

        if (updateError || !topupData) {
            console.error("Error updating topup record:", updateError);
            return NextResponse.json({ message: "Error updating record" }, { status: 500 });
        }

        // 4. Update Balance if Settlement (and simpler handling to avoid double balance)
        // Note: For production, we should have a 'balance_updated' flag or check transaction logs.
        // For now, reliance on status change from pending -> settlement is 'okay' but risky if reruning.
        // However, we checked `currentRecord.status === newStatus` above, so we only update balance if status CHANGED.

        if (newStatus === 'settlement' && currentRecord?.status !== 'settlement') {
            const { data: userData } = await supabase
                .from('tb_masyarakat')
                .select('saldo')
                .eq('id', topupData.id_user)
                .single();

            if (userData) {
                const newBalance = (userData.saldo || 0) + topupData.amount;
                await supabase
                    .from('tb_masyarakat')
                    .update({ saldo: newBalance })
                    .eq('id', topupData.id_user);
            }
        }

        return NextResponse.json({ message: "Status updated", status: newStatus });

    } catch (error) {
        console.error("Manual Check Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
