import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Package, Gavel, CheckCircle2, Clock } from "lucide-react"
import { MonthFilter } from "../month-filter"
import { ExportBarangButton, type BarangRow } from "../export-buttons"
import { Suspense } from "react"

export default async function LaporanBarangPage({
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

    const { data: lelangs } = await supabase
        .from("tb_lelang")
        .select(`
            id, tgl_lelang, harga_akhir, status,
            barang:barang_id(id, nama, harga_awal, tanggal)
        `)
        .gte("tgl_lelang", startDate)
        .lte("tgl_lelang", endDate)
        .order("tgl_lelang", { ascending: false })

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

    const terjual = lelangs?.filter(l => l.status === "ditutup").length ?? 0
    const belumSelesai = lelangs?.filter(l => l.status !== "ditutup").length ?? 0

    const exportData: BarangRow[] = (lelangs ?? []).map((l, i) => {
        const barang = Array.isArray(l.barang) ? l.barang[0] : l.barang
        const statusLabel = l.status === "ditutup" ? "Selesai" : l.status === "dibuka" ? "Berjalan" : "Pending"
        return {
            no: i + 1,
            namaBarang: (barang as any)?.nama ?? "-",
            tanggalDaftar: (barang as any)?.tanggal ?? "-",
            tanggalLelang: l.tgl_lelang ?? "-",
            hargaAwal: (barang as any)?.harga_awal ?? 0,
            hargaAkhir: l.harga_akhir ?? 0,
            statusLelang: statusLabel,
        }
    })

    return (
        <>
            <SiteHeader title="Laporan Barang" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Laporan Barang</h1>
                        <p className="text-muted-foreground mt-1">
                            Data barang yang dilelangkan bulan <span className="font-semibold text-foreground">{namaBulan} {activeTahun}</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Suspense>
                            <MonthFilter bulan={activeBulan} tahun={activeTahun} />
                        </Suspense>
                        <ExportBarangButton
                            data={exportData}
                            bulan={activeBulan}
                            tahun={activeTahun}
                            namaBulan={namaBulan}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card><CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600"><Package className="h-5 w-5" /></div>
                        <div><p className="text-xs text-muted-foreground font-medium uppercase">Total Barang</p><p className="text-2xl font-bold">{lelangs?.length ?? 0}</p></div>
                    </CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-full p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div>
                        <div><p className="text-xs text-muted-foreground font-medium uppercase">Lelang Selesai</p><p className="text-2xl font-bold">{terjual}</p></div>
                    </CardContent></Card>
                    <Card><CardContent className="p-4 flex items-center gap-3">
                        <div className="rounded-full p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600"><Clock className="h-5 w-5" /></div>
                        <div><p className="text-xs text-muted-foreground font-medium uppercase">Masih Berjalan</p><p className="text-2xl font-bold">{belumSelesai}</p></div>
                    </CardContent></Card>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {!lelangs || lelangs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="rounded-full bg-muted p-5 mb-4"><Package className="h-8 w-8 text-muted-foreground" /></div>
                                <h3 className="font-semibold text-lg">Tidak Ada Data</h3>
                                <p className="text-muted-foreground mt-1 text-sm">Tidak ada barang yang dilelangkan pada bulan {namaBulan} {activeTahun}.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="pl-4 w-10">#</TableHead>
                                        <TableHead>Nama Barang</TableHead>
                                        <TableHead>Tanggal Daftar</TableHead>
                                        <TableHead>Tanggal Lelang</TableHead>
                                        <TableHead className="text-right">Harga Awal</TableHead>
                                        <TableHead className="text-right">Harga Akhir</TableHead>
                                        <TableHead className="text-center">Status Lelang</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lelangs.map((l, i) => {
                                        const barang = Array.isArray(l.barang) ? l.barang[0] : l.barang
                                        const isDitutup = l.status === "ditutup"
                                        const isDibuka = l.status === "dibuka"
                                        return (
                                            <TableRow key={l.id} className="hover:bg-muted/30">
                                                <TableCell className="pl-4 text-muted-foreground text-sm">{i + 1}</TableCell>
                                                <TableCell className="font-medium">{(barang as any)?.nama ?? "-"}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate((barang as any)?.tanggal)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(l.tgl_lelang)}</TableCell>
                                                <TableCell className="text-right text-sm">{formatCurrency((barang as any)?.harga_awal)}</TableCell>
                                                <TableCell className="text-right font-semibold">{formatCurrency(l.harga_akhir)}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={isDitutup ? "bg-slate-500 hover:bg-slate-600 text-white border-0" : isDibuka ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0" : "bg-amber-100 text-amber-700 border-0"}>
                                                        {isDitutup ? <><CheckCircle2 className="h-3 w-3 mr-1 inline" />Selesai</> : isDibuka ? <><Gavel className="h-3 w-3 mr-1 inline" />Berjalan</> : "Pending"}
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
