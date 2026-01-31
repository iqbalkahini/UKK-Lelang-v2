"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function joinAuction(lelangId: number, hargaAwal: number) {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 2. Get Masyarakat Data (Saldo & ID)
    const { data: masyarakat } = await supabase
        .from('tb_masyarakat')
        .select('id, saldo')
        .eq('user_id', user.id)
        .single();

    if (!masyarakat) throw new Error("Masyarakat data not found");

    // 3. Check Saldo
    if ((masyarakat.saldo || 0) < hargaAwal) {
        throw new Error("Saldo tidak mencukupi untuk membayar jaminan.");
    }

    // 4. Check if already deposited (Double check)
    const { data: existingDeposit } = await supabase
        .from('tb_lelang_deposit')
        .select('id')
        .eq('id_lelang', lelangId)
        .eq('id_user', masyarakat.id)
        .single();

    if (existingDeposit) return { success: true, message: "Sudah deposit" };

    // 5. Transaction: Deduct Saldo & Create Deposit Record
    // Supabase JS doesn't support transactions easily without RPC, but we can do sequential updates.
    // Ideally we wrap this in RPC, but for now sequential:
    // A. Deduct Saldo
    const newSaldo = masyarakat.saldo - hargaAwal;
    const { error: updateError } = await supabase
        .from('tb_masyarakat')
        .update({ saldo: newSaldo })
        .eq('id', masyarakat.id);

    if (updateError) throw new Error("Gagal memotong saldo");

    // B. Create Deposit
    const { error: insertError } = await supabase
        .from('tb_lelang_deposit')
        .insert({
            id_lelang: lelangId,
            id_user: masyarakat.id,
            jumlah_jaminan: hargaAwal
        });

    if (insertError) {
        // Rollback Balance (Manual)
        await supabase
            .from('tb_masyarakat')
            .update({ saldo: masyarakat.saldo }) // Restore old balance
            .eq('id', masyarakat.id);
        throw new Error("Gagal menyimpan data deposit");
    }

    revalidatePath(`/masyarakat/lelang/${lelangId}`);
    return { success: true };
}

export async function placeBid(lelangId: number, amount: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: masyarakat } = await supabase
        .from('tb_masyarakat')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!masyarakat) throw new Error("User not found");

    // 1. Validate Deposit
    const { data: deposit } = await supabase
        .from('tb_lelang_deposit')
        .select('id')
        .eq('id_lelang', lelangId)
        .eq('id_user', masyarakat.id)
        .single();

    if (!deposit) throw new Error("Anda harus membayar jaminan terlebih dahulu.");

    // 2. Validate Bid Amount vs Highest Bid
    const { data: highestBidRecord } = await supabase
        .from('history_lelang')
        .select('penawaran_harga')
        .eq('lelang_id', lelangId)
        .order('penawaran_harga', { ascending: false })
        .limit(1)
        .single();

    const currentHighest = highestBidRecord?.penawaran_harga || 0;

    // Also get basic price
    const { data: lelang } = await supabase
        .from('tb_lelang')
        .select('barang:tb_barang(harga_awal)')
        .eq('id', lelangId)
        .single();

    // @ts-ignore
    const hargaAwal = lelang?.barang?.harga_awal || 0;
    const minBid = Math.max(currentHighest, hargaAwal);

    if (amount <= minBid) {
        throw new Error(`Tawaran harus lebih tinggi dari ${new Intl.NumberFormat('id-ID').format(minBid)}`);
    }

    // 3. Insert Bid
    // Need barang_id for history_lelang table structure (as seen in schema check earlier)
    const { data: lelangData } = await supabase.from('tb_lelang').select('barang_id').eq('id', lelangId).single();

    const { error } = await supabase
        .from('history_lelang')
        .insert({
            lelang_id: lelangId,
            barang_id: lelangData?.barang_id,
            user_id: masyarakat.id,
            penawaran_harga: amount
        });

    if (error) throw new Error("Gagal melakukan penawaran");

    revalidatePath(`/masyarakat/lelang/${lelangId}`);
    return { success: true };
}
