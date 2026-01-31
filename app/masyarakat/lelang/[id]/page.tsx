import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AuctionAction } from "./auction-action";

export default async function DetailLelangPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch Lelang & Barang
    const { data: lelang } = await supabase
        .from('tb_lelang')
        .select(`
            *,
            barang:tb_barang(*)
        `)
        .eq('id', id)
        .single();

    if (!lelang) notFound();

    // 2. Fetch Highest Bid
    const { data: highestBidRecord } = await supabase
        .from('history_lelang')
        .select('penawaran_harga')
        .eq('lelang_id', id)
        .order('penawaran_harga', { ascending: false })
        .limit(1)
        .single();

    const highestBid = highestBidRecord?.penawaran_harga || 0;

    // 3. User & Deposit Check
    const { data: { user } } = await supabase.auth.getUser();

    let hasDeposited = false;
    let userSaldo = 0;

    if (user) {
        // Get Masyarakat ID
        const { data: masyarakat } = await supabase
            .from('tb_masyarakat')
            .select('id, saldo')
            .eq('user_id', user.id)
            .single();

        if (masyarakat) {
            userSaldo = masyarakat.saldo;
            // Check Deposit
            const { data: deposit } = await supabase
                .from('tb_lelang_deposit')
                .select('id')
                .eq('id_lelang', id)
                .eq('id_user', masyarakat.id)
                .single();

            if (deposit) hasDeposited = true;
        }
    }

    return (
        <>
            <SiteHeader title="Detail Lelang" />
            <div className="container p-4 md:p-8 max-w-5xl mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href="/masyarakat/lelang">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Katalog
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Image */}
                    <div className="space-y-4">
                        <div className="aspect-square relative rounded-xl overflow-hidden bg-muted border">
                            {lelang.barang?.image_urls && lelang.barang.image_urls.length > 0 ? (
                                <Image
                                    src={lelang.barang.image_urls[0]}
                                    alt={lelang.barang.nama}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Info & Action */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold capitalize">
                                    Status: {lelang.status}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold">{lelang.barang?.nama}</h1>
                            <p className="text-muted-foreground mt-2">{lelang.barang?.deskripsi_barang}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y">
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-sm">Harga Awal</span>
                                <p className="text-xl font-bold">
                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(lelang.barang?.harga_awal || 0)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-sm">Tawaran Tertinggi</span>
                                <p className="text-xl font-bold text-primary">
                                    {highestBid > 0
                                        ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(highestBid)
                                        : "-"
                                    }
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-sm flex items-center gap-1"><Calendar className="h-3 w-3" /> Tanggal</span>
                                <p className="font-medium">{new Date(lelang.tgl_lelang).toLocaleDateString('id-ID')}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-sm flex items-center gap-1"><Clock className="h-3 w-3" /> Jam</span>
                                <p className="font-medium">{lelang.waktu_mulai} - {lelang.waktu_selesai} WIB</p>
                            </div>
                        </div>

                        {/* Action Section */}
                        {lelang.status === 'dibuka' ? (
                            <AuctionAction
                                lelangId={lelang.id}
                                hargaAwal={lelang.barang?.harga_awal || 0}
                                highestBid={highestBid}
                                hasDeposited={hasDeposited}
                            />
                        ) : (
                            <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                                Lelang ini belum dimulai atau sudah ditutup.
                            </div>
                        )}

                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>Saldo Anda: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(userSaldo)}</p>
                            <p className="italic">*Uang jaminan diperlukan untuk memastikan keseriusan penawar.</p>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
