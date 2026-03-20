import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { redirect } from "next/navigation"
import { PaymentButton } from "./payment-button"

export default async function WinsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: masyarakat } = await supabase
        .from('tb_masyarakat')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!masyarakat) redirect('/')

    const { data: wins } = await supabase
        .from('tb_lelang')
        .select(`
            id,
            tgl_lelang,
            waktu_mulai,
            waktu_selesai,
            harga_akhir,
            status,
            barang:tb_barang(nama, deskripsi_barang, harga_awal, image_urls)
        `)
        .eq('status', 'ditutup')
        .eq('user_id', masyarakat.id)

    const formatCurrency = (amount: number | null) => {
        if (!amount) return "-";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    }

    return (
        <>
            <SiteHeader title={'Menang Lelang'} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-7xl mx-auto w-full">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Menang Lelang</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Lelang yang berhasil Anda menangkan dan menunggu pembayaran barang.
                    </p>
                </div>

                {(!wins || wins.length === 0) ? (
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-12 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                            <span className="text-3xl">🏆</span>
                        </div>
                        <h2 className="text-xl font-semibold">Belum Ada Kemenangan</h2>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                            Anda belum memenangkan lelang apapun. Terus ikuti lelang dan berikan penawaran terbaik Anda!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wins.map((lelang) => {
                            // Extract barang correctly whether it's an array or object
                            const barangItem = Array.isArray(lelang.barang) ? lelang.barang[0] : lelang.barang;
                            const imageUrl = barangItem?.image_urls?.[0];
                            // The amount to pay is (harga akhir) - (5% jaminan of harga awal)
                            // But for simplicity, we can let them pay the full price remaining.
                            // The deposit was 5% of harga awal. 
                            const deposit = Math.ceil((barangItem?.harga_awal || 0) * 0.05);
                            const finalPayment = Math.max(0, lelang.harga_akhir - deposit);

                            return (
                                <Card key={lelang.id} className="overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                                    <div className="relative aspect-video bg-muted overflow-hidden">
                                        {imageUrl ? (
                                            <Image
                                                src={imageUrl}
                                                alt={barangItem?.nama || "Barang Lelang"}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                                No Image
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                                            <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-sm border-0 font-semibold px-3 py-1 ml-auto shrink-0 w-min">
                                                Menang
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="line-clamp-1">{barangItem?.nama}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 flex-grow">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end border-b pb-3 border-border/50">
                                                <div className="space-y-1">
                                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Harga Akhir Anda</span>
                                                    <p className="text-xl font-bold text-primary">
                                                        {formatCurrency(lelang.harga_akhir)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 pt-1">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Sudah Dibayar (Jaminan):</span>
                                                    <span className="font-medium text-emerald-600">-{formatCurrency(deposit)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm font-semibold border-t pt-1.5 mt-1 border-dashed">
                                                    <span className="text-foreground">Sisa Pembayaran:</span>
                                                    <span className="text-foreground">{formatCurrency(finalPayment)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 bg-muted/30 border-t">
                                        <PaymentButton
                                            lelangId={lelang.id}
                                            // @ts-ignore
                                            barangId={lelang.barang_id || (barangItem as any)?.id || 0}
                                            amount={finalPayment}
                                        />
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </>
    )
}
