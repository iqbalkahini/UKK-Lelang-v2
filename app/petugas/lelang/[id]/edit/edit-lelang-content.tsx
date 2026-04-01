"use client";

import { updateLelang, type Lelang } from "@/api/lelang";
import { LelangForm } from "@/components/lelang-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EditLelangContentProps {
    id: string;
    lelang: Lelang;
}

export function EditLelangContent({ id, lelang }: EditLelangContentProps) {
    const router = useRouter();

    const handleSubmit = async (data: {
        barang_id: number;
        tgl_lelang: string;
        waktu_mulai: string;
        waktu_selesai: string;
        status: 'pending' | "dibuka" | "ditutup" | "dibayar";
        is_manual: boolean;
    }) => {
        if (lelang.status === "dibayar") {
            toast.error("Lelang yang sudah dibayar tidak bisa diedit");
            return;
        }

        try {
            await updateLelang(parseInt(id), data);
            toast.success("Lelang berhasil diupdate");
            router.push(`/petugas/lelang`);
            router.refresh();
        } catch (error) {
            console.error("Error updating lelang:", error);
            toast.error("Gagal mengupdate lelang");
        }
    };

    if (lelang.status === "dibayar") {
        return (
            <div className="px-4 lg:px-6 py-5 space-y-6">
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

                <Alert>
                    <AlertTitle>Lelang terkunci</AlertTitle>
                    <AlertDescription>
                        Lelang ini sudah dibayar, sehingga data lelang tidak bisa diubah lagi.
                    </AlertDescription>
                </Alert>
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
                            is_manual: lelang.is_manual,
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
