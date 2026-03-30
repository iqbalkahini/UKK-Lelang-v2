"use client";

import { Lelang } from "@/api/lelang";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hammer, Calendar, Clock, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";

interface LelangCardProps {
    lelang: Lelang;
    onOpen?: (id: number) => void;
    actionText?: string;
}

export function LelangCardSkeleton() {
    return (
        <Card className="overflow-hidden flex flex-col h-full border-muted-foreground/10">
            <Skeleton className="aspect-video w-full rounded-none" />

            <CardHeader className="p-4 pb-2">
                <Skeleton className="h-7 w-3/4" />
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow space-y-3">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                <div className="pt-2 border-t border-muted-foreground/10">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
        </Card>
    );
}

export function LelangCard({ lelang, onOpen, actionText }: LelangCardProps) {
    const isPaid = lelang.status === "dibayar";

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
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return "-";
        return timeString.substring(0, 5);
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "dibuka": return "default";
            case "pending": return "outline";
            case "ditutup": return "destructive";
            case "dibayar": return "secondary";
            default: return "secondary";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "dibuka": return "Dibuka";
            case "pending": return "Tertunda";
            case "ditutup": return "Ditutup";
            case "dibayar": return "Dibayar";
            default: return status;
        }
    };

    const imageUrl = lelang.barang?.image_urls?.[0] || null;

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-muted-foreground/10 flex flex-col h-full">
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={lelang.barang?.nama || "Barang Lelang"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full w-full bg-secondary/30">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant={getStatusVariant(lelang.status)} className="shadow-sm">
                        {getStatusLabel(lelang.status)}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                    {lelang.barang?.nama || "Produk Tanpa Nama"}
                </h3>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow space-y-3">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(lelang.tgl_lelang)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(lelang.waktu_mulai)} - {formatTime(lelang.waktu_selesai)} WIB</span>
                    </div>
                    <div className="flex items-center text-xs font-medium gap-2 pt-1">
                        <Badge 
                            variant="outline" 
                            className={lelang.is_manual 
                                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" 
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"}
                        >
                            Pengaturan: {lelang.is_manual ? "Manual" : "Otomatis"}
                        </Badge>
                    </div>
                </div>

                <div className="pt-2 border-t border-muted-foreground/10">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Harga Awal</p>
                            <p className="text-lg font-bold text-primary">
                                {formatCurrency(lelang.barang?.harga_awal || 0)}
                            </p>
                        </div>
                        {lelang.harga_akhir && (
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Harga Akhir</p>
                                <p className="text-sm font-semibold">{formatCurrency(lelang.harga_akhir)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full gap-2 shadow-sm font-semibold"
                    onClick={() => onOpen?.(lelang.id)}
                    disabled={isPaid}
                    variant={lelang.status === 'pending' || lelang.status === 'ditutup' ? 'default' : 'secondary'}
                >
                    <Hammer className="w-4 h-4" />
                    {isPaid ? "Sudah Dibayar" : actionText || "Buka Lelang Sekarang"}
                </Button>
            </CardFooter>
        </Card>
    );
}
