"use server";

import midtransClient from "midtrans-client";
import { createClient } from "@/lib/supabase/server";

export async function createTopupToken(amount: number, lelangId?: number) {
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

        // 3. Create db record first to get ID
        const insertData: any = {
            id_user: masyarakat.id,
            amount: amount,
            status: 'pending'
        };

        if (lelangId) {
            insertData.lelang_id = lelangId;
        }

        const { data: topupRecord, error } = await supabase
            .from('tb_topup')
            .insert(insertData)
            .select()
            .single();

        if (error || !topupRecord) throw new Error("Failed to create topup record");

        // 4. Create Snap Transaction
        const parameter = {
            transaction_details: {
                order_id: topupRecord.id,
                gross_amount: amount
            },
            customer_details: {
                first_name: masyarakat.nama_lengkap,
                email: user.email,
            },
            item_details: lelangId ? [{
                id: `LELANG-${lelangId}`,
                price: amount,
                quantity: 1,
                name: "Uang Jaminan Lelang"
            }] : undefined
        };

        const transaction = await snap.createTransaction(parameter);
        const token = transaction.token;

        // Update token to db
        await supabase
            .from('tb_topup')
            .update({ snap_token: token })
            .eq('id', topupRecord.id);

        return { token, orderId: topupRecord.id };

    } catch (error) {
        console.error("Error creating topup token:", error);
        throw error;
    }
}

export async function cancelTopup(orderId: string) {
    try {
        const supabase = await createClient();
        await supabase
            .from('tb_topup')
            .update({ status: 'cancel' })
            .eq('id', orderId);
        return { success: true };
    } catch (error) {
        console.error("Error cancelling topup:", error);
        return { success: false };
    }
}

export async function getWalletData(page: number = 1, limit: number = 7) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch Saldo
        const { data: masyarakatData } = await supabase
            .from('tb_masyarakat')
            .select('id, saldo')
            .eq('user_id', user.id)
            .single();

        if (masyarakatData) {
            // Calculate range
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            // Fetch Transactions
            const { data: transactionData } = await supabase
                .from('tb_topup')
                .select('*')
                .eq('id_user', masyarakatData.id)
                .order('created_at', { ascending: false })
                .range(from, to);

            return {
                saldo: masyarakatData.saldo,
                transactions: transactionData || []
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching wallet data:", error);
        return null; // Handle error gracefully or rethrow depending on needs
    }
}

export async function syncTopupStatus(orderId: string) {
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

        // 4. Update Database
        const { data: topupData } = await supabase
            .from('tb_topup')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select()
            .single();

        if (topupData && newStatus === 'settlement') {
            if (topupData.lelang_id) {
                // Ensure no duplicate deposit
                const { data: existing } = await supabase
                    .from('tb_lelang_deposit')
                    .select('id')
                    .eq('id_lelang', topupData.lelang_id)
                    .eq('id_user', topupData.id_user)
                    .single();
                
                if (!existing) {
                    await supabase
                        .from('tb_lelang_deposit')
                        .insert({
                            id_lelang: topupData.lelang_id,
                            id_user: topupData.id_user,
                            jumlah_jaminan: topupData.amount,
                            status: 'active'
                        });
                }
            } else {
                // Regular Topup update balance logic
                const { data: userData } = await supabase
                    .from('tb_masyarakat')
                    .select('saldo')
                    .eq('id', topupData.id_user)
                    .single();

                if (userData) {
                    const { data: checkProcessed } = await supabase
                        .from('tb_topup')
                        .select('processed_at')
                        .eq('id', orderId)
                        .single();
                    
                    if (!checkProcessed?.processed_at) {
                        const newBalance = (userData.saldo || 0) + topupData.amount;
                        await supabase
                            .from('tb_masyarakat')
                            .update({ saldo: newBalance })
                            .eq('id', topupData.id_user);
                        
                        await supabase
                            .from('tb_topup')
                            .update({ processed_at: new Date().toISOString() })
                            .eq('id', orderId);
                    }
                }
            }
        }

        return { status: newStatus };
    } catch (error) {
        console.error("Error syncing topup status:", error);
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

        if (error || !payRecord) throw new Error("Failed to create payment record");

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
