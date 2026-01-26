"use client";

import { useState, useEffect } from "react";
import { getLelangById, updateStatusLelang, getHighestBid, type Lelang } from "@/api/lelang";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, PlayCircle, StopCircle } from "lucide-react";
import Link from "next/link";

export default function LelangDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const [lelang, setLelang] = useState<Lelang | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchLelang = async () => {
            try {
                const data = await getLelangById(parseInt(params.id));
                setLelang(data);
            } catch (error) {
                console.error("Error fetching lelang:", error);
                toast.error("Gagal mengambil data lelang");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLelang();
    }, [params.id]);

    const handleToggleStatus = async () => {
        if (!lelang) return;

        setIsUpdatingStatus(true);
        try {
            const newStatus =
                lelang.status === "dibuka"
                    ? "ditutup"
                    : lelang.status === "ditutup"
                        ? "dibuka"
                        : "dibuka";

            let harga_akhir = undefined;
            if (newStatus === "ditutup") {
                harga_akhir = await getHighestBid(lelang.id_lelang);
            }

            const updatedLelang = await updateStatusLelang(
                lelang.id_lelang,
                newStatus,
                harga_akhir ?? undefined
            );
            setLelang(updatedLelang);
            toast.success(
                `Lelang berhasil ${newStatus === "dibuka" ? "dibuka" : "ditutup"}`
            );
        } catch (error) {
            console.error("Error toggling status:", error);
            toast.error("Gagal mengubah status lelang");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return "-";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "dibuka":
                return <Badge className="bg-green-500 hover:bg-green-600">Dibuka</Badge>;
            case "ditutup":
                return <Badge className="bg-red-500 hover:bg-red-600">Ditutup</Badge>;
            case "pending":
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
            default:
                return <Badge>{status}</Badge>;
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
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
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
                <Link href="/petugas/lelang">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Detail Lelang #{lelang.id_lelang}
                        </h1>
                        <p className="text-muted-foreground">
                            Informasi lengkap tentang lelang ini
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/petugas/lelang/${lelang.id_lelang}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            onClick={handleToggleStatus}
                            disabled={isUpdatingStatus}
                            variant={lelang.status === "dibuka" ? "destructive" : "default"}
                        >
                            {lelang.status === "dibuka" ? (
                                <>
                                    <StopCircle className="mr-2 h-4 w-4" />
                                    Tutup Lelang
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Buka Lelang
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Lelang</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">ID Lelang</p>
                                <p className="text-lg font-semibold">{lelang.id_lelang}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <div className="mt-1">{getStatusBadge(lelang.status)}</div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Tanggal Lelang
                            </p>
                            <p className="text-lg">{formatDate(lelang.tanggal_lelang)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Harga Akhir
                            </p>
                            <p className="text-lg font-semibold">
                                {formatCurrency(lelang.harga_akhir)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Barang</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Nama Barang
                            </p>
                            <p className="text-lg font-semibold">{lelang.barang?.nama || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Harga Awal
                            </p>
                            <p className="text-lg">
                                {formatCurrency(lelang.barang?.harga_awal ?? 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
                            <p className="text-sm">{lelang.barang?.deskripsi_barang || "-"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
