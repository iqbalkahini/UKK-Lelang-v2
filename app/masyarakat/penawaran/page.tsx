import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Gavel, Trophy, Calendar, TrendingUp } from "lucide-react";

const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
});

export default async function PenawaranPage() {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) notFound();

    // 2. Get masyarakat ID
    const { data: masyarakat } = await supabase
        .from("tb_masyarakat")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!masyarakat) notFound();

    // 3. Fetch all bids by user, with lelang and barang info
    const { data: bids, error } = await supabase
        .from("history_lelang")
        .select(`
            id,
            penawaran_harga,
            created_at,
            lelang:tb_lelang(
                id,
                status,
                harga_akhir,
                tgl_lelang,
                user_id,
                barang:tb_barang(
                    id,
                    nama,
                    harga_awal,
                    image_urls
                )
            )
        `)
        .eq("user_id", masyarakat.id)
        .order("created_at", { ascending: false });

    // 4. Group bids by lelang_id
    const lelangMap = new Map<number, {
        lelang: any;
        bids: { id: number; penawaran_harga: number; created_at: string }[];
        myHighestBid: number;
        isWinner: boolean;
    }>();

    for (const bid of (bids || [])) {
        const lelang = bid.lelang as any;
        if (!lelang) continue;

        const lelangId = lelang.id;

        if (!lelangMap.has(lelangId)) {
            lelangMap.set(lelangId, {
                lelang,
                bids: [],
                myHighestBid: 0,
                isWinner: lelang.user_id === masyarakat.id,
            });
        }

        const entry = lelangMap.get(lelangId)!;
        entry.bids.push({ id: bid.id, penawaran_harga: bid.penawaran_harga, created_at: bid.created_at });
        if (bid.penawaran_harga > entry.myHighestBid) {
            entry.myHighestBid = bid.penawaran_harga;
        }
    }

    const lelangList = Array.from(lelangMap.values());

    return (
        <>
            <SiteHeader title="Penawaran Saya" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto w-full">
                <div>
                    <h1 className="text-3xl font-bold">Penawaran Saya</h1>
                    <p className="text-muted-foreground mt-1">Riwayat penawaran yang telah Anda lakukan pada setiap lelang</p>
                </div>

                {lelangList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/30">
                        <Gavel className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="font-semibold text-lg">Belum Ada Penawaran</p>
                        <p className="text-muted-foreground text-sm mt-1">Anda belum pernah melakukan penawaran pada lelang apapun.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {lelangList.map(({ lelang, bids, myHighestBid, isWinner }) => {
                            const barang = lelang.barang;
                            const statusColor =
                                lelang.status === "dibuka" ? "bg-green-100 text-green-700 border-green-200" :
                                    lelang.status === "ditutup" ? "bg-zinc-100 text-zinc-600 border-zinc-200" :
                                        "bg-yellow-100 text-yellow-700 border-yellow-200";

                            return (
                                <div key={lelang.id} className="border rounded-xl overflow-hidden bg-card shadow-sm">
                                    <div className="flex gap-4 p-4">
                                        {/* Image */}
                                        <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted border">
                                            {barang?.image_urls?.[0] ? (
                                                <Image
                                                    src={barang.image_urls[0]}
                                                    alt={barang.nama}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                                <div>
                                                    <p className="font-semibold text-base leading-tight">{barang?.nama ?? "—"}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(lelang.tgl_lelang).toLocaleDateString("id-ID", { dateStyle: "long" })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {isWinner && lelang.status === "ditutup" && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-0.5 rounded-full">
                                                            <Trophy className="h-3 w-3" /> Pemenang
                                                        </span>
                                                    )}
                                                    <span className={`text-xs font-medium border px-2 py-0.5 rounded-full capitalize ${statusColor}`}>
                                                        {lelang.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Harga Awal</p>
                                                    <p className="font-medium">{formatter.format(barang?.harga_awal ?? 0)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Tawaran Tertinggi Saya</p>
                                                    <p className="font-semibold text-primary flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3" />
                                                        {formatter.format(myHighestBid)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Jumlah Penawaran</p>
                                                    <p className="font-medium">{bids.length}x</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bid History Detail */}
                                    <details className="border-t group">
                                        <summary className="px-4 py-2.5 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors select-none list-none flex items-center justify-between">
                                            <span>Lihat detail penawaran ({bids.length})</span>
                                            <span className="text-xs group-open:rotate-180 transition-transform inline-block">▾</span>
                                        </summary>
                                        <div className="px-4 pb-3 divide-y">
                                            {bids
                                                .sort((a, b) => b.penawaran_harga - a.penawaran_harga)
                                                .map((bid, i) => (
                                                    <div key={bid.id} className="flex justify-between items-center py-2 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            {i === 0 && (
                                                                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Tertinggi</span>
                                                            )}
                                                            <span className="text-muted-foreground text-xs">
                                                                {new Date(bid.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                                                            </span>
                                                        </div>
                                                        <span className="font-semibold">{formatter.format(bid.penawaran_harga)}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </details>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
