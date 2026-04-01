import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { CheckCircle2, Clock, TrendingUp, ReceiptText } from "lucide-react"
import { MonthFilter } from "@/components/laporan/month-filter"
import { ExportPembayaranButton, type PembayaranRow } from "@/components/laporan/export-buttons"
import { Suspense } from "react"

export default async function LaporanPembayaranPage({
    searchParams,
}: {
    searchParams: Promise<{ bulan?: string; tahun?: string }>
}) {
    const { bulan, tahun } = await searchParams
    const now = new Date()
    const activeBulan = bulan ?? String(now.getMonth() + 1)
    const activeTahun = tahun ?? String(now.getFullYear())

    const supabase = await createClient()

    const startDate = `${activeTahun}-${String(activeBulan).padStart(2, "0")}-01`
    const endDate = new Date(Number(activeTahun), Number(activeBulan), 0).toISOString().split("T")[0]

    const { data: payments } = await supabase
        .from("tb_pembayaran")
        .select(`
            id, tgl_pembayaran, jumlah_pembayaran, status,
            barang:barang_id(nama),
            masyarakat:user_id(nama_lengkap, username),
            lelang:lelang_id(harga_akhir)
        `)
        .gte("tgl_pembayaran", startDate)
        .lte("tgl_pembayaran", endDate)
        .order("tgl_pembayaran", { ascending: false })

    const formatCurrency = (amount: number | null) => {
        if (!amount) return "-"
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
    }
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-"
        return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(dateStr))
    }

    const namaBulan = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
        new Date(Number(activeTahun), Number(activeBulan) - 1)
    )

    const sudahDibayar = payments?.filter(p => p.status === "Sudah Dibayar") ?? []
    const belumDibayar = payments?.filter(p => p.status === "Belum Dibayar") ?? []
    const totalNominal = sudahDibayar.reduce((acc, p) => acc + (p.jumlah_pembayaran ?? 0), 0)

    // Prepare export data
    const exportData: PembayaranRow[] = (payments ?? []).map((p, i) => {
        const barang = Array.isArray(p.barang) ? p.barang[0] : p.barang
        const mas = Array.isArray(p.masyarakat) ? p.masyarakat[0] : p.masyarakat
        const lelang = Array.isArray(p.lelang) ? p.lelang[0] : p.lelang
        return {
            no: i + 1,
            namaBarang: (barang as any)?.nama ?? "-",
            pemenang: (mas as any)?.nama_lengkap ?? "-",
            username: (mas as any)?.username ?? "-",
            tanggal: p.tgl_pembayaran ?? "-",
            hargaAkhir: (lelang as any)?.harga_akhir ?? 0,
            jumlahDibayar: p.jumlah_pembayaran ?? 0,
            status: p.status ?? "-",
        }
    })

    return (
        <>
            <SiteHeader title="Laporan Pembayaran" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Laporan Pembayaran</h1>
                        <p className="text-muted-foreground mt-1">
                            Data pembayaran bulan <span className="font-semibold text-foreground">{namaBulan} {activeTahun}</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Suspense>
                            <MonthFilter bulan={activeBulan} tahun={activeTahun} />
                        </Suspense>
                        <ExportPembayaranButton
                            data={exportData}
                            bulan={activeBulan}
                            tahun={activeTahun}
                            namaBulan={namaBulan}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card><CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600"><ReceiptText className="h-5 w-5" /></div>
                        <div><p className="text-xs text-muted-foreground font-medium uppercase">Total</p><p className="text-2xl font-bold">{payments?.length ?? 0}</p></div>
                    </CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-full p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div>
                        <div><p className="text-xs text-muted-foreground font-medium uppercase">Lunas</p><p className="text-2xl font-bold">{sudahDibayar.length}</p></div>
                    </CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-full p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600"><Clock className="h-5 w-5" /></div>
                        <div><p className="text-xs text-muted-foreground font-medium uppercase">Belum Bayar</p><p className="text-2xl font-bold">{belumDibayar.length}</p></div>
                    </CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600"><TrendingUp className="h-5 w-5" /></div>
                        <div><p className="text-xs text-muted-foreground font-medium uppercase">Total Diterima</p><p className="text-base font-bold leading-tight">{formatCurrency(totalNominal)}</p></div>
                    </CardContent></Card>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {!payments || payments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="rounded-full bg-muted p-5 mb-4"><ReceiptText className="h-8 w-8 text-muted-foreground" /></div>
                                <h3 className="font-semibold text-lg">Tidak Ada Data</h3>
                                <p className="text-muted-foreground mt-1 text-sm">Tidak ada pembayaran pada bulan {namaBulan} {activeTahun}.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="pl-4 w-10">#</TableHead>
                                        <TableHead>Nama Barang</TableHead>
                                        <TableHead>Pemenang</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead className="text-right">Harga Akhir</TableHead>
                                        <TableHead className="text-right">Dibayar</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((p, i) => {
                                        const barang = Array.isArray(p.barang) ? p.barang[0] : p.barang
                                        const mas = Array.isArray(p.masyarakat) ? p.masyarakat[0] : p.masyarakat
                                        const lelang = Array.isArray(p.lelang) ? p.lelang[0] : p.lelang
                                        const lunas = p.status === "Sudah Dibayar"
                                        return (
                                            <TableRow key={p.id} className="hover:bg-muted/30">
                                                <TableCell className="pl-4 text-muted-foreground text-sm">{i + 1}</TableCell>
                                                <TableCell className="font-medium">{(barang as any)?.nama ?? "-"}</TableCell>
                                                <TableCell>
                                                    <p className="text-sm font-medium">{(mas as any)?.nama_lengkap ?? "-"}</p>
                                                    <p className="text-xs text-muted-foreground">@{(mas as any)?.username ?? "-"}</p>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(p.tgl_pembayaran)}</TableCell>
                                                <TableCell className="text-right text-sm">{formatCurrency((lelang as any)?.harga_akhir)}</TableCell>
                                                <TableCell className="text-right font-semibold">{formatCurrency(p.jumlah_pembayaran)}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={lunas ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-0"}>
                                                        {lunas ? <><CheckCircle2 className="h-3 w-3 mr-1 inline" />Lunas</> : <><Clock className="h-3 w-3 mr-1 inline" />Belum Bayar</>}
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
