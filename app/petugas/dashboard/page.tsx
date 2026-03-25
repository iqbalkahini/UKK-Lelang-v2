import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ChartPieInteractive } from "@/components/chart-pie-interactive"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function Page() {
    const supabase = await createClient()

    // 1. Total Barang
    const { count: countBarang } = await supabase
        .from('tb_barang')
        .select('*', { count: 'exact', head: true })

    // 2. Lelang Aktif
    const { count: countLelangAktif } = await supabase
        .from('tb_lelang')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'dibuka')

    // 2.1 Lelang Belum Aktif / Pending
    const { count: countLelangPending } = await supabase
        .from('tb_lelang')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    // 2.2 Lelang Ditutup
    const { count: countLelangDitutup } = await supabase
        .from('tb_lelang')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ditutup')

    // 3. Menunggu Pembayaran
    const { count: countMenungguPembayaran } = await supabase
        .from('tb_pembayaran')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Belum Dibayar')

    // 4. Total Pendapatan (Bulan Ini - opsional, atau all time)
    // Untuk sederhana, kita ambil all time settlement
    const { data: payments } = await supabase
        .from('tb_pembayaran')
        .select('jumlah_pembayaran')
        .eq('status', 'settlement')

    const totalPendapatan = payments?.reduce((acc, curr) => acc + (curr.jumlah_pembayaran || 0), 0) || 0

    // 5. Lelang Terbaru (5 Teratas yang ditutup)
    const { data: recentLelangs } = await supabase
        .from('tb_lelang')
        .select(`
            id, tgl_lelang, harga_akhir, status,
            barang:barang_id(nama),
            pemenang:user_id(nama_lengkap)
        `)
        .eq('status', 'ditutup')
        .order('id', { ascending: false })
        .limit(5)

    const formatCurrency = (amount: number | null) => {
        if (!amount) return "-"
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-"
        return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(dateStr))
    }

    // 6. Data Area Chart (Valuasi Lelang)
    const { data: historyData } = await supabase
        .from('tb_lelang')
        .select('tgl_lelang, harga_akhir, barang:barang_id(harga_awal)')
        .eq('status', 'ditutup')
        .order('tgl_lelang', { ascending: true })

    // Grouping by Date
    type AreaData = { date: string; harga_akhir: number; harga_awal: number }
    const chartMap = new Map<string, AreaData>()
    
    if (historyData) {
        historyData.forEach((row) => {
            if (!row.tgl_lelang) return;
            const tgl = row.tgl_lelang.split('T')[0] 
            const hAwal = (row.barang as any)?.harga_awal || 0;
            const hAkhir = row.harga_akhir || 0;
            
            if (chartMap.has(tgl)) {
                const existing = chartMap.get(tgl)!
                existing.harga_awal += hAwal
                existing.harga_akhir += hAkhir
            } else {
                chartMap.set(tgl, { date: tgl, harga_awal: hAwal, harga_akhir: hAkhir })
            }
        })
    }
    const chartDataArray = Array.from(chartMap.values())

    return (
        <>
            <SiteHeader title="Dashboard" />
            <div className="flex flex-1 flex-col p-4 md:p-6 gap-6 max-w-7xl mx-auto w-full">
                
                {/* 1. Overview Cards */}
                <div className="mb-2">
                    <SectionCards 
                        totalBarang={countBarang || 0}
                        lelangAktif={countLelangAktif || 0}
                        menungguPembayaran={countMenungguPembayaran || 0}
                        totalPendapatan={totalPendapatan}
                    />
                </div>

                {/* 2. Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Area Chart (Kiri, lebih lebar) */}
                    <div className="lg:col-span-2">
                        <ChartAreaInteractive chartData={chartDataArray} />
                    </div>

                    {/* Pie Chart (Kanan) */}
                    <div className="lg:col-span-1">
                        <ChartPieInteractive 
                            aktif={countLelangAktif || 0}
                            belumAktif={countLelangPending || 0}
                            ditutup={countLelangDitutup || 0}
                        />
                    </div>
                </div>

                {/* 3. Tabel Aktivitas Terbaru */}
                <Card className="border shadow-xs mt-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Lelang Terbaru Selesai</CardTitle>
                        <CardDescription>
                            5 Lelang terakhir yang sudah ditutup
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="pl-6">Barang & Tgl</TableHead>
                                    <TableHead className="text-right">Harga Akhir</TableHead>
                                    <TableHead className="pr-6 text-center">Pemenang</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!recentLelangs || recentLelangs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                            Belum ada lelang selesai
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentLelangs.map((lelang) => {
                                        const barang = Array.isArray(lelang.barang) ? lelang.barang[0] : lelang.barang
                                        const pemenang = Array.isArray(lelang.pemenang) ? lelang.pemenang[0] : lelang.pemenang
                                        
                                        return (
                                            <TableRow key={lelang.id} className="hover:bg-muted/30">
                                                <TableCell className="pl-6">
                                                    <div className="font-medium text-sm line-clamp-1 break-all">
                                                        {(barang as any)?.nama || "-"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {formatDate(lelang.tgl_lelang)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-sm">
                                                    {formatCurrency(lelang.harga_akhir)}
                                                </TableCell>
                                                <TableCell className="pr-6">
                                                    <div className="flex justify-center">
                                                        <Badge variant="outline" className="text-xs font-normal">
                                                            {(pemenang as any)?.nama_lengkap?.split(' ')[0] || "-"}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
