"use client";

import { Suspense } from "react";
import { LelangForm } from "@/components/lelang-form";
import { createLelang } from "@/api/lelang";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

export default function CreateLelangPage() {
  const router = useRouter();
  const { user } = useUser();

  const handleSubmit = async (data: {
    barang_id: number;
    tgl_lelang: string;
    waktu_mulai: string;
    waktu_selesai: string;
    status: 'pending' | "dibuka" | "ditutup" | "dibayar";
    is_manual: boolean
  }) => {
    try {
      if (!user) {
        toast.error("User tidak ditemukan");
        return;
      }

      await createLelang({
        ...data,
        petugas_id: user.id,
        harga_akhir: 0,
      });

      toast.success("Lelang berhasil dibuat");
      router.push("/petugas/lelang");
    } catch (error: unknown) {
      console.error("Error creating lelang:", error);
      const err = error as { code?: string; message?: string; details?: string };
      if (err?.code === "23505" || err?.message?.includes("409") || err?.details?.includes("already exists")) {
        toast.error("Barang ini sudah dilelang");
      } else {
        toast.error(err?.message || "Gagal membuat lelang");
      }
    }
  };

  return (
    <div className="px-4 lg:px-6 py-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Tambah Lelang</h1>
        <p className="text-muted-foreground">Buat lelang baru untuk barang</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Lelang Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <LelangForm
              onSubmit={handleSubmit}
              onCancel={() => router.push("/petugas/lelang")}
              submitLabel="Buat Lelang"
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
