"use client";

import { useState, useEffect, use } from "react"; // 1. Tambah import 'use'
import { getLelangById, updateLelang, type Lelang } from "@/api/lelang";
import { LelangForm } from "@/components/lelang-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// 2. Hapus kata 'async' di depan function
export default function EditLelangPage({
    params,
}: {
    params: Promise<{ id: string }>; // Tipe params adalah Promise
}) {
    // 3. Gunakan 'use()' untuk membuka Promise params di Client Component
    const { id } = use(params);

    const [lelang, setLelang] = useState<Lelang | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Karena id sudah didapat dari use(params), kita bisa pakai langsung
        if (!id) return;

        const fetchLelang = async () => {
            try {
                const data = await getLelangById(parseInt(id));
                setLelang(data);
            } catch (error) {
                console.error("Error fetching lelang:", error);
                toast.error("Gagal mengambil data lelang");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLelang();
    }, [id]);

    const handleSubmit = async (data: {
        barang_id: number;
        tgl_lelang: string;
        waktu_mulai: string;
        waktu_selesai: string;
        status: 'pending' | "dibuka" | "ditutup";
    }) => {
        try {
            await updateLelang(parseInt(id), data);
            toast.success("Lelang berhasil diupdate");
            router.push(`/petugas/lelang`);
        } catch (error) {
            console.error("Error updating lelang:", error);
            toast.error("Gagal mengupdate lelang");
        }
    };

    if (isLoading) {
        return (
            <div className="px-4 lg:px-6 py-5">
                <Skeleton className="h-8 w-64 mb-6" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!lelang) {
        return (
            <div className="px-4 lg:px-6 py-5">
                <p className="text-center text-muted-foreground">Lelang tidak ditemukan</p>
            </div>
        );
    }

    return (
        <div className="px-4 lg:px-6 py-5">
            <div className="mb-6">
                <Link href={`/petugas/lelang/${id}`}>
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">
                    Edit Lelang #{lelang.id}
                </h1>
                <p className="text-muted-foreground">Perbarui informasi lelang</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Form Edit Lelang</CardTitle>
                </CardHeader>
                <CardContent>
                    <LelangForm
                        initialData={{
                            barang_id: lelang.barang_id,
                            tgl_lelang: lelang.tgl_lelang,
                            waktu_mulai: lelang.waktu_mulai,
                            waktu_selesai: lelang.waktu_selesai,
                            status: lelang.status,
                        }}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push(`/petugas/lelang/${id}`)}
                        submitLabel="Simpan Perubahan"
                    />
                </CardContent>
            </Card>
        </div>
    );
}