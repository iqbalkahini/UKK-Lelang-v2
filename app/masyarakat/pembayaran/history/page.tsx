import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { redirect } from "next/navigation"
import { CheckCircle2, History, ReceiptText } from "lucide-react"
import Image from "next/image"

export default async function PaymentHistoryPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: masyarakat } = await supabase
        .from('tb_masyarakat')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!masyarakat) redirect('/')

    const { data: riwayat } = await supabase
        .from('tb_pembayaran')
        .select(`
            id,
            tgl_pembayaran,
            jumlah_pembayaran,
            status,
            barang:barang_id(nama, image_urls),
            lelang:lelang_id(harga_akhir, tgl_lelang)
        `)
        .eq('user_id', masyarakat.id)
        .eq('status', 'Sudah Dibayar')
        .order('tgl_pembayaran', { ascending: false })

    const formatCurrency = (amount: number | null) => {
        if (!amount) return "-"
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-"
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(new Date(dateStr))
    }

    const totalNominal = riwayat?.reduce((acc, r) => acc + (r.jumlah_pembayaran ?? 0), 0) ?? 0

    return (
        <>
            <SiteHeader title="Riwayat Pembayaran" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Riwayat Pembayaran</h1>
                    <p className="text-muted-foreground mt-1">
                        Histori transaksi pembayaran lelang yang telah selesai.
                    </p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-full p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                                <ReceiptText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Total Transaksi</p>
                                <p className="text-2xl font-bold">{riwayat?.length ?? 0}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Total Dibayar</p>
                                <p className="text-lg font-bold leading-tight">{formatCurrency(totalNominal)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {!riwayat || riwayat.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="rounded-full bg-muted p-5 mb-4">
                                    <History className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold text-lg">Belum Ada Riwayat</h3>
                                <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                                    Pembayaran yang telah selesai akan muncul di sini.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-10 pl-4">#</TableHead>
                                        <TableHead>Barang</TableHead>
                                        <TableHead>Tanggal Lelang</TableHead>
                                        <TableHead>Tanggal Bayar</TableHead>
                                        <TableHead className="text-right">Harga Akhir</TableHead>
                                        <TableHead className="text-right">Dibayar</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {riwayat.map((item, index) => {
                                        const barang = Array.isArray(item.barang) ? item.barang[0] : item.barang
                                        const lelang = Array.isArray(item.lelang) ? item.lelang[0] : item.lelang
                                        const imageUrl = (barang as any)?.image_urls?.[0]

                                        return (
                                            <TableRow key={item.id} className="hover:bg-muted/30">
                                                <TableCell className="pl-4 text-muted-foreground text-sm">{index + 1}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-10 w-14 rounded overflow-hidden bg-muted shrink-0">
                                                            {imageUrl ? (
                                                                <Image
                                                                    src={imageUrl}
                                                                    alt={(barang as any)?.nama ?? ""}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                                                                    N/A
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="font-medium line-clamp-1">{(barang as any)?.nama ?? "-"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate((lelang as any)?.tgl_lelang)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(item.tgl_pembayaran)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm">
                                                    {formatCurrency((lelang as any)?.harga_akhir)}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {formatCurrency(item.jumlah_pembayaran)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Lunas
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
