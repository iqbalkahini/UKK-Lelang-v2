"use server";

import midtransClient from "midtrans-client";
import { createClient } from "@/lib/supabase/server";

export async function createDeposit(amount: number, lelangId?: number) {
    try {
        if (!lelangId) throw new Error("ID Lelang diperlukan untuk membayar jaminan.");

        const supabase = await createClient();

        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // Get masyarakat detail
        const { data: masyarakat } = await supabase
            .from('tb_masyarakat')
            .select('id, nama_lengkap, username')
            .eq('user_id', user.id)
            .single();

        if (!masyarakat) throw new Error("Masyarakat data not found");

        // 2. Validate Amount
        const { data: lelang } = await supabase
            .from('tb_lelang')
            .select('barang:tb_barang(harga_awal)')
            .eq('id', lelangId)
            .single();

        if (!lelang || !lelang.barang) throw new Error("Data lelang tidak ditemukan");

        const hargaAwal = (lelang.barang as any).harga_awal || 0;
        const expectedDeposit = Math.ceil(hargaAwal * 0.05);

        if (amount !== expectedDeposit) {
            throw new Error(`Nominal jaminan tidak sesuai. Uang jaminan yang harus dibayar adalah Rp${new Intl.NumberFormat('id-ID').format(expectedDeposit)}`);
        }

        // 3. Initialize Snap
        const snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY || "",
            clientKey: process.env.MIDTRANS_CLIENT_KEY || ""
        });

        // 4. Create or Get db record
        let depositRecord;
        const { data: existingDeposit } = await supabase
            .from('tb_lelang_deposit')
            .select('*')
            .eq('id_lelang', lelangId)
            .eq('id_user', masyarakat.id)
            .single();

        if (existingDeposit) {
            if (existingDeposit.status === 'active') {
                throw new Error("Anda sudah membayar jaminan untuk lelang ini.");
            }
            depositRecord = existingDeposit;

            if (depositRecord.jumlah_jaminan !== amount) {
                const { data: updated } = await supabase
                    .from('tb_lelang_deposit')
                    .update({ jumlah_jaminan: amount })
                    .eq('id', depositRecord.id)
                    .select()
                    .single();
                depositRecord = updated;
            }
        } else {
            const { data: newDeposit, error: insertError } = await supabase
                .from('tb_lelang_deposit')
                .insert({
                    id_lelang: lelangId,
                    id_user: masyarakat.id,
                    jumlah_jaminan: amount,
                    status: 'inactive'
                })
                .select()
                .single();

            if (insertError || !newDeposit) throw new Error("Gagal membuat data jaminan lelang");
            depositRecord = newDeposit;
        }

        // 5. Create Snap Transaction
        const orderIdString = `DEP-${depositRecord.id}-${Date.now()}`;
        const parameter = {
            transaction_details: {
                order_id: orderIdString,
                gross_amount: amount
            },
            customer_details: {
                first_name: masyarakat.nama_lengkap,
                email: user.email,
            },
            item_details: [{
                id: `LELANG-${lelangId}`,
                price: amount,
                quantity: 1,
                name: "Uang Jaminan Lelang"
            }]
        };

        const transaction = await snap.createTransaction(parameter);
        const token = transaction.token;

        return { token, orderId: orderIdString };

    } catch (error: any) {
        console.error("Error creating deposit token:", error);
        throw new Error(error.message || "Gagal memproses pembayaran jaminan.");
    }
}

export async function syncDepositStatus(orderId: string) {
    try {
        const supabase = await createClient();

        // 1. Initialize API
        const core = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY || "",
            clientKey: process.env.MIDTRANS_CLIENT_KEY || ""
        });

        // 2. Fetch Status from Midtrans
        const midtransStatus = await (core as any).transaction.status(orderId);
        const transactionStatus = midtransStatus.transaction_status;
        const fraudStatus = midtransStatus.fraud_status;

        // 3. Determine new status
        let newStatus = 'pending';
        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                newStatus = 'challenge';
            } else if (fraudStatus == 'accept') {
                newStatus = 'settlement';
            }
        } else if (transactionStatus == 'settlement') {
            newStatus = 'settlement';
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
            newStatus = 'failure';
        } else if (transactionStatus == 'pending') {
            newStatus = 'pending';
        }

        if (String(orderId).startsWith('DEP-')) {
            const actualDepositId = parseInt(orderId.split('-')[1]);
            await supabase
                .from('tb_lelang_deposit')
                .update({ status: newStatus === 'settlement' ? 'active' : 'inactive' })
                .eq('id', actualDepositId);
        }

        return { status: newStatus };
    } catch (error) {
        console.error("Error syncing deposit status:", error);
        throw error;
    }
}

export async function createPaymentToken(lelangId: number, barangId: number, amount: number) {
    try {
        const supabase = await createClient();

        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // Get masyarakat detail
        const { data: masyarakat } = await supabase
            .from('tb_masyarakat')
            .select('id, nama_lengkap, username')
            .eq('user_id', user.id)
            .single();

        if (!masyarakat) throw new Error("Masyarakat data not found");

        // 2. Initialize Snap
        const snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY || "",
            clientKey: process.env.MIDTRANS_CLIENT_KEY || ""
        });

        // 3. Create db record first
        const { data: payRecord, error } = await supabase
            .from('tb_pembayaran')
            .insert({
                lelang_id: lelangId,
                barang_id: barangId,
                user_id: masyarakat.id,
                tgl_pembayaran: new Date().toISOString().split('T')[0],
                jumlah_pembayaran: amount,
                status: 'pending'
            })
            .select()
            .single();

        if (error || !payRecord) throw new Error(error?.message || "Failed to create payment record");

        // 4. Create Snap Transaction       
        const parameter = {
            transaction_details: {
                order_id: `PAY-${payRecord.id}-${Date.now()}`,
                gross_amount: amount
            },
            customer_details: {
                first_name: masyarakat.nama_lengkap,
                email: user.email,
            },
            item_details: [{
                id: `WIN-${lelangId}`,
                price: amount,
                quantity: 1,
                name: "Pembayaran Barang Lelang"
            }]
        };

        const transaction = await snap.createTransaction(parameter);
        const token = transaction.token;

        return { token, orderId: payRecord.id };

    } catch (error) {
        console.error("Error creating payment token:", error);
        throw error;
    }
}

export async function syncPaymentStatus(orderId: number) {
    try {
        const supabase = await createClient();
        await supabase
            .from('tb_pembayaran')
            .update({ status: 'settlement' })
            .eq('id', orderId);

        // Optionally update tb_lelang to indicate it has been paid fully?
        // Let's just update the payment status to settlement for now.

        return { status: 'settlement' };
    } catch (error) {
        console.error("Error syncing payment status:", error);
        throw error;
    }
}
