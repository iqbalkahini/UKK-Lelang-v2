'use client'

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import { getActiveAuctions, Lelang } from "@/api/lelang";
import { useEffect, useState } from "react";

export default function LelangAktifPage() {
    const [auctions, setAuctions] = useState<Lelang[]>([]);

    useEffect(() => {
        const fetchAuctions = async () => {
            const auctions = await getActiveAuctions();
            setAuctions(auctions);
        }
        fetchAuctions();
    }, []);

    console.log(auctions);

    return (
        <>
            <SiteHeader title={'Lelang Aktif'} />
            <div className="container p-4 md:p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Lelang Aktif</h1>
                    <p className="text-muted-foreground">Temukan barang impian Anda dan mulai menawar.</p>
                </div>

                {!auctions || auctions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/10">
                        <p className="text-lg font-medium text-muted-foreground">Belum ada lelang yang sedang berlangsung.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {auctions.map((lelang) => (
                            <Card key={lelang.id} className="overflow-hidden flex flex-col">
                                <div className="aspect-video relative bg-muted">
                                    {lelang.barang?.image_urls && lelang.barang.image_urls.length > 0 ? (
                                        <Image
                                            src={lelang.barang.image_urls[0]}
                                            alt={lelang.barang.nama}
                                            fill
                                            className="object-cover transition-transform hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs font-bold rounded-full uppercase">
                                        {lelang.status}
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{lelang.barang?.nama}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(lelang.tgl_lelang).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>Mulai: {lelang.waktu_mulai}</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t w-full">
                                        <p className="text-xs uppercase font-semibold text-muted-foreground">Harga Awal</p>
                                        <p className="text-lg font-bold text-foreground">
                                            {new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                                minimumFractionDigits: 0
                                            }).format(lelang.barang?.harga_awal || 0)}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/masyarakat/lelang/${lelang.id}`}>
                                            Lihat Detail
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
