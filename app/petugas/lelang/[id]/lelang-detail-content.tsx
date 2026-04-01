"use client";

import { type Lelang } from "@/api/lelang";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Gavel, History, Image as ImageIcon, Info, Pencil } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface LelangDetailContentProps {
    id: string;
    lelang: Lelang;
}

export function LelangDetailContent({ id, lelang }: LelangDetailContentProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "dibuka":
                return <Badge className="bg-green-500 hover:bg-green-600">Dibuka</Badge>;
            case "ditutup":
                return <Badge className="bg-red-500 hover:bg-red-600">Ditutup</Badge>;
            case "pending":
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
            case "dibayar":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Dibayar</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="px-4 lg:px-6 py-5 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/petugas/lelang">
                        <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Daftar
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Detail Lelang #{lelang.id}
                        </h1>
                        {getStatusBadge(lelang.status)}
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Dibuat pada {format(new Date(lelang.created_at), "EEEE, d MMMM yyyy", { locale: idLocale })}
                    </p>
                </div>
                
                {lelang.status !== "dibayar" && (
                    <Link href={`/petugas/lelang/${id}/edit`}>
                        <Button className="w-full md:w-auto">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Lelang
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left 2 Columns */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden border-none shadow-md">
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" />
                                <CardTitle className="text-xl">Informasi Barang</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/3 aspect-square relative rounded-xl overflow-hidden bg-muted group">
                                    {lelang.barang?.image_urls && lelang.barang.image_urls.length > 0 ? (
                                        <Image
                                            src={lelang.barang.image_urls[0]}
                                            alt={lelang.barang.nama}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                            <ImageIcon className="h-10 w-10 opacity-20" />
                                            <span className="text-xs">Tidak ada gambar</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground">{lelang.barang?.nama || "Tanpa Nama"}</h3>
                                        <p className="text-muted-foreground mt-2 leading-relaxed">
                                            {lelang.barang?.deskripsi_barang || "Tidak ada deskripsi barang."}
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                                            <p className="text-xs text-primary/70 uppercase font-bold tracking-wider mb-1">Harga Awal</p>
                                            <p className="text-xl font-black text-primary">
                                                {formatCurrency(lelang.barang?.harga_awal || 0)}
                                            </p>
                                        </div>
                                        <div className="bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                                            <p className="text-xs text-green-600/70 uppercase font-bold tracking-wider mb-1">Harga Akhir</p>
                                            <p className="text-xl font-black text-green-600">
                                                {formatCurrency(lelang.harga_akhir || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="jadwal" className="w-full">
                        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-4 bg-muted/50 p-1">
                            <TabsTrigger value="jadwal" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                                <Calendar className="h-4 w-4 mr-2" />
                                Jadwal Lelang
                            </TabsTrigger>
                            <TabsTrigger value="pemenang" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                                <Gavel className="h-4 w-4 mr-2" />
                                Informasi Pemenang
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="jadwal" className="mt-0">
                            <Card className="border-none shadow-sm bg-background">
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors">
                                            <div className="bg-primary/10 p-3 rounded-full shrink-0">
                                                <Calendar className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">Tanggal Pelaksanaan</h4>
                                                <p className="text-muted-foreground mt-1">
                                                    {format(new Date(lelang.tgl_lelang), "d MMMM yyyy", { locale: idLocale })}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors">
                                            <div className="bg-primary/10 p-3 rounded-full shrink-0">
                                                <Clock className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">Waktu Lelang</h4>
                                                <p className="text-muted-foreground mt-1 font-medium">
                                                    {lelang.waktu_mulai.substring(0, 5)} - {lelang.waktu_selesai.substring(0, 5)} WIB
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    Lelang diatur secara {lelang.is_manual ? "Manual" : "Otomatis Sistem"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        <TabsContent value="pemenang" className="mt-0">
                            <Card className="border-none shadow-sm bg-background">
                                <CardContent className="pt-8 flex flex-col items-center justify-center text-center">
                                    <div className="bg-muted p-4 rounded-full mb-4">
                                        <History className="h-8 w-8 text-muted-foreground opacity-50" />
                                    </div>
                                    <h4 className="font-bold text-foreground">Belum Ada Informasi Pemenang</h4>
                                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                                        Informasi pemenang akan muncul di sini setelah lelang ditutup dan diproses oleh sistem.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    <Card className="border-none shadow-md overflow-hidden bg-primary text-primary-foreground">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Gavel className="h-5 w-5" />
                                Status Penawaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center py-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                    <p className="text-xs text-white/70 uppercase font-black tracking-widest mb-1 shadow-sm">Penawaran Tertinggi</p>
                                    <p className="text-4xl font-black drop-shadow-md">
                                        {formatCurrency(lelang.harga_akhir || 0)}
                                    </p>
                                </div>
                                <div className="text-sm p-4 bg-white/5 rounded-lg text-white/80 leading-relaxed italic border-l-4 border-white/30">
                                    "Penawaran ini akan diperbarui secara otomatis setiap kali ada masyarakat yang melakukan bid."
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4 border-b">
                            <CardTitle className="text-lg">Informasi Tambahan</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2 group">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">ID Lelang</p>
                                <p className="font-mono text-xs bg-muted px-2 py-1 rounded w-fit border border-muted-foreground/10 group-hover:bg-muted-foreground/5 transition-colors">
                                    {id}
                                </p>
                            </div>
                            <div className="space-y-2 group">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Petugas Penanggung Jawab</p>
                                <p className="font-bold flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                    ID Petugas: {lelang.petugas_id}
                                </p>
                            </div>
                            <div className="pt-4 border-t">
                                <p className="text-xs text-muted-foreground italic text-center">
                                    Terakhir diperbarui: {format(new Date(lelang.updated_at), "HH:mm", { locale: idLocale })} WIB
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
