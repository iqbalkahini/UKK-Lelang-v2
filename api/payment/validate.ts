"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function validatePayment(pembayaranId: number) {
    const supabase = await createClient();

    const { data: pembayaran, error } = await supabase
        .from("tb_pembayaran")
        .update({ status: "Sudah Dibayar" })
        .eq("id", pembayaranId)
        .select("lelang_id")
        .single();

    if (error) throw new Error(error.message);

    if (pembayaran?.lelang_id) {
        const { error: lelangError } = await supabase
            .from("tb_lelang")
            .update({ status: "dibayar" })
            .eq("id", pembayaran.lelang_id);

        if (lelangError) throw new Error(lelangError.message);
    }

    revalidatePath("/petugas/pembayaran");
    return { success: true };
}
