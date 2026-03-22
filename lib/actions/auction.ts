"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function joinAuction(lelangId: number, hargaAwal: number) {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // 2. Get Masyarakat Data (Saldo & ID)
    const { data: masyarakat } = await supabase
        .from('tb_masyarakat')
        .select('id, saldo')
        .eq('user_id', user.id)
        .single();

    if (!masyarakat) return { error: "Masyarakat data not found" };

    // 3. Check Saldo
    if ((masyarakat.saldo || 0) < hargaAwal) {
        return { error: "Saldo tidak mencukupi untuk membayar jaminan." };
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

    if (updateError) return { error: "Gagal memotong saldo" };

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
        return { error: "Gagal menyimpan data deposit" };
    }

    revalidatePath(`/masyarakat/lelang/${lelangId}`);
    return { success: true };
}

export async function placeBid(lelangId: number, amount: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: masyarakat } = await supabase
        .from('tb_masyarakat')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!masyarakat) return { error: "User not found" };

    // 1. Validate Deposit
    const { data: deposit } = await supabase
        .from('tb_lelang_deposit')
        .select('id')
        .eq('id_lelang', lelangId)
        .eq('id_user', masyarakat.id)
        .single();

    if (!deposit) return { error: "Anda harus membayar jaminan terlebih dahulu." };

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
        return { error: `Tawaran harus lebih tinggi dari ${new Intl.NumberFormat('id-ID').format(minBid)}` };
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

    if (error) return { error: "Gagal melakukan penawaran" };

    revalidatePath(`/masyarakat/lelang/${lelangId}`);
    return { success: true };
}


export async function closeAuction(lelangId: number) {
    const supabase = await createClient();

    // 1. Get highest bid
    const { data: highestBid } = await supabase
        .from('history_lelang')
        .select('user_id, penawaran_harga, barang_id')
        .eq('lelang_id', lelangId)
        .order('penawaran_harga', { ascending: false })
        .limit(1)
        .single();

    let updateData: any = { status: "ditutup" };

    if (highestBid) {
        updateData.user_id = highestBid.user_id;
        updateData.harga_akhir = highestBid.penawaran_harga;
    }

    // 2. Update tb_lelang status → ditutup
    const { data: lelangUpdated, error } = await supabase
        .from('tb_lelang')
        .update(updateData)
        .eq('id', lelangId)
        .select('barang_id')
        .single();

    if (error) return { error: "Gagal menutup lelang" };

    // 3. Buat record pembayaran di tb_pembayaran jika ada pemenang
    if (highestBid) {
        const barangId = lelangUpdated?.barang_id ?? highestBid.barang_id;

        // Hitung sisa pembayaran (harga akhir - deposit 5% harga awal)
        const { data: barang } = await supabase
            .from('tb_barang')
            .select('harga_awal')
            .eq('id', barangId)
            .single();

        const deposit = Math.ceil((barang?.harga_awal ?? 0) * 0.05);
        const sisaPembayaran = Math.max(0, highestBid.penawaran_harga - deposit);

        // Cek apakah sudah ada record (hindari duplikat jika dipanggil ulang)
        const { data: existing } = await supabase
            .from('tb_pembayaran')
            .select('id')
            .eq('lelang_id', lelangId)
            .eq('user_id', highestBid.user_id)
            .maybeSingle();

        if (!existing) {
            await supabase.from('tb_pembayaran').insert({
                lelang_id: lelangId,
                barang_id: barangId,
                user_id: highestBid.user_id,
                tgl_pembayaran: new Date().toISOString().split('T')[0],
                jumlah_pembayaran: sisaPembayaran,
                status: 'Belum Dibayar',
            });
        }
    }

    revalidatePath(`/petugas/lelang/tutup`);
    revalidatePath(`/masyarakat/pembayaran/wins`);
    return { success: true };
}
