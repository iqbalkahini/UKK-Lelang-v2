import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"

import data from "./data.json"

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: masyarakat } = await supabase.from('tb_masyarakat').select('*').eq('user_id', user?.id || '').single()

  // 1. Total Barang (Market-wide)
  const { count: countBarang } = await supabase
    .from('tb_barang')
    .select('*', { count: 'exact', head: true })

  // 2. Lelang Aktif (Market-wide)
  const { count: countLelangAktif } = await supabase
    .from('tb_lelang')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'dibuka')

  // 3. Menunggu Pembayaran (User-specific)
  const { count: countMenungguPembayaran } = await supabase
    .from('tb_pembayaran')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Belum Dibayar')
    .eq('user_id', masyarakat?.id || '')

  // 4. Total Pengeluaran (User-specific settlement payments)
  const { data: payments } = await supabase
    .from('tb_pembayaran')
    .select('jumlah_pembayaran')
    .eq('status', 'Sudah Dibayar')
    .eq('user_id', masyarakat?.id || '')

  const totalPengeluaran = payments?.reduce((acc, curr) => acc + (curr.jumlah_pembayaran || 0), 0) || 0

  // 5. Data Area Chart (User Winnings over time)
  const { data: historyData } = await supabase
    .from('tb_lelang')
    .select('tgl_lelang, harga_akhir, barang:barang_id(harga_awal)')
    .eq('status', 'ditutup')
    .eq('user_id', user?.id || '') // Items won by this user
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
      <SiteHeader title={'Dashboard'} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards
              totalBarang={countBarang || 0}
              lelangAktif={countLelangAktif || 0}
              menungguPembayaran={countMenungguPembayaran || 0}
              totalPendapatan={totalPengeluaran}
            />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive chartData={chartDataArray} />
            </div>
            <Suspense>
              {/* <DataTable data={data} /> */}
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
