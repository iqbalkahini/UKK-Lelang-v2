import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { redirect } from "next/navigation"
import { PaymentButton } from "./payment-button"
import { CheckCircle2, Clock } from "lucide-react"

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

    // Query dari tb_pembayaran join tb_lelang dan tb_barang
    const { data: pembayaranList } = await supabase
        .from('tb_pembayaran')
        .select(`
            id,
            tgl_pembayaran,
            jumlah_pembayaran,
            status,
            lelang:lelang_id(
                id,
                tgl_lelang,
                waktu_mulai,
                waktu_selesai,
                harga_akhir,
                barang_id
            ),
            barang:barang_id(
                id,
                nama,
                deskripsi_barang,
                harga_awal,
                image_urls
            )
        `)
        .eq('user_id', masyarakat.id)
        .order('tgl_pembayaran', { ascending: false })

    const formatCurrency = (amount: number | null) => {
        if (!amount) return "-";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <>
            <SiteHeader title={'Menang Lelang'} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-7xl mx-auto w-full">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Menang Lelang</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Daftar lelang yang berhasil Anda menangkan beserta status pembayarannya.
                    </p>
                </div>

                {(!pembayaranList || pembayaranList.length === 0) ? (
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
                        {pembayaranList.map((item) => {
                            const barang = Array.isArray(item.barang) ? item.barang[0] : item.barang
                            const lelang = Array.isArray(item.lelang) ? item.lelang[0] : item.lelang
                            const imageUrl = (barang as any)?.image_urls?.[0]
                            const isSudahDibayar = item.status === 'Sudah Dibayar'

                            return (
                                <Card key={item.id} className="overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                                    <div className="relative aspect-video bg-muted overflow-hidden">
                                        {imageUrl ? (
                                            <Image
                                                src={imageUrl}
                                                alt={(barang as any)?.nama || "Barang Lelang"}
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
                                        <CardTitle className="line-clamp-1">{(barang as any)?.nama}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 flex-grow">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end border-b pb-3 border-border/50">
                                                <div className="space-y-1">
                                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Harga Akhir</span>
                                                    <p className="text-xl font-bold text-primary">
                                                        {formatCurrency((lelang as any)?.harga_akhir)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 pt-1">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Sisa Pembayaran:</span>
                                                    <span className="font-semibold">{formatCurrency(item.jumlah_pembayaran)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Status:</span>
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            isSudahDibayar
                                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 gap-1"
                                                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-0 gap-1"
                                                        }
                                                    >
                                                        {isSudahDibayar
                                                            ? <><CheckCircle2 className="h-3 w-3" /> Sudah Dibayar</>
                                                            : <><Clock className="h-3 w-3" /> Belum Dibayar</>
                                                        }
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 bg-muted/30 border-t">
                                        {isSudahDibayar ? (
                                            <div className="w-full text-center text-sm text-muted-foreground py-1">
                                                ✅ Pembayaran selesai
                                            </div>
                                        ) : (
                                            <PaymentButton
                                                lelangId={(lelang as any)?.id}
                                                barangId={(barang as any)?.id ?? 0}
                                                amount={item.jumlah_pembayaran}
                                            />
                                        )}
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
