"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function validatePayment(pembayaranId: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("tb_pembayaran")
        .update({ status: "Sudah Dibayar" })
        .eq("id", pembayaranId);

    if (error) throw new Error(error.message);

    revalidatePath("/petugas/pembayaran");
    return { success: true };
}
