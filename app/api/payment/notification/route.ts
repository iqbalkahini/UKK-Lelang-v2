import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";

// Initialize Core API for signature verification
const core = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || ""
});

export async function POST(req: NextRequest) {
    try {
        const notificationJson = await req.json();

        // 1. Verify notification signature (Optional but recommended, doing simple check via status for now)
        // Midtrans SDK also has helper for verification if needed, but checking status response is standard.
        const statusResponse = await (core as any).transaction.notification(notificationJson);

        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        const supabase = await createClient();

        // Determine status
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

        // Check if this is a final payment (PAY-) or topup (integer ID)
        if (String(orderId).startsWith('PAY-')) {
            // This is tb_pembayaran
            const actualPaymentId = parseInt(orderId.split('-')[1]);
            
            const { error: updateError } = await supabase
                .from('tb_pembayaran')
                .update({ status: newStatus })
                .eq('id', actualPaymentId);

            if (updateError) {
                console.error("Error updating pembayaran record:", updateError);
                return NextResponse.json({ message: "Error updating record" }, { status: 500 });
            }

            return NextResponse.json({ message: "OK" });
        }

        // 2. Otherwise Update tb_topup
        const { data: topupData, error: updateError } = await supabase
            .from('tb_topup')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select()
            .single();

        if (updateError || !topupData) {
            console.error("Error updating topup record:", updateError);
            return NextResponse.json({ message: "Error updating record" }, { status: 500 });
        }

        // 3. If Settlement (Success), Update User Balance or Create Deposit
        if (newStatus === 'settlement') {
            if (topupData.lelang_id) {
                // It's an auction deposit - Create deposit record
                const { error: depositError } = await supabase
                    .from('tb_lelang_deposit')
                    .insert({
                        id_lelang: topupData.lelang_id,
                        id_user: topupData.id_user,
                        jumlah_jaminan: topupData.amount,
                        status: 'active'
                    });
                
                if (depositError) {
                    console.error("Error creating deposit record:", depositError);
                }
            } else {
                // It's a regular topup - Update balance
                const { data: userData, error: userError } = await supabase
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
        }

        return NextResponse.json({ message: "OK" });

    } catch (error) {
        console.error("Midtrans Notification Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
