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
                newStatus = 'Sudah Dibayar';
            }
        } else if (transactionStatus == 'settlement') {
            newStatus = 'Sudah Dibayar';
        } else if (transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire') {
            newStatus = 'Belum Dibayar';
        } else if (transactionStatus == 'pending') {
            newStatus = 'Belum Dibayar';
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

        if (String(orderId).startsWith('DEP-')) {
            const actualDepositId = parseInt(orderId.split('-')[1]);
            const { error: updateError } = await supabase
                .from('tb_lelang_deposit')
                .update({ status: newStatus === 'settlement' ? 'active' : 'inactive' })
                .eq('id', actualDepositId);

            if (updateError) {
                console.error("Error updating deposit record:", updateError);
                return NextResponse.json({ message: "Error updating deposit record" }, { status: 500 });
            }

            return NextResponse.json({ message: "OK" });
        }

        // Return OK for unrecognized to prevent retries
        return NextResponse.json({ message: "OK" });

    } catch (error) {
        console.error("Midtrans Notification Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
