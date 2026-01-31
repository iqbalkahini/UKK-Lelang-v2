"use server";

import midtransClient from "midtrans-client";
import { createClient } from "@/lib/supabase/server";

export async function createTopupToken(amount: number) {
    try {
        const supabase = await createClient();

        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // Get masyarakat detail
        const { data: masyarakat } = await supabase
            .from('tb_masyarakat')
            .select('id, nama_lengkap, username') // assuming email is not in tb_masyarakat based on schema, use auth email if needed
            .eq('user_id', user.id) // Assuming joined by user_id auth
            .single();

        if (!masyarakat) throw new Error("Masyarakat data not found");

        // 2. Initialize Snap
        const snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY || "",
            clientKey: process.env.MIDTRANS_CLIENT_KEY || ""
        });

        // 3. Create db record first to get ID
        const { data: topupRecord, error } = await supabase
            .from('tb_topup')
            .insert({
                id_user: masyarakat.id,
                amount: amount,
                status: 'pending'
            })
            .select()
            .single();

        if (error || !topupRecord) throw new Error("Failed to create topup record");

        // 4. Create Snap Transaction
        const parameter = {
            transaction_details: {
                order_id: topupRecord.id, // Using the UUID from tb_topup
                gross_amount: amount
            },
            customer_details: {
                first_name: masyarakat.nama_lengkap,
                email: user.email, // Use auth email
            }
        };

        const transaction = await snap.createTransaction(parameter);
        const token = transaction.token;

        // Update token to db
        await supabase
            .from('tb_topup')
            .update({ snap_token: token })
            .eq('id', topupRecord.id);

        return token;

    } catch (error) {
        console.error("Error creating topup token:", error);
        throw error;
    }
}
