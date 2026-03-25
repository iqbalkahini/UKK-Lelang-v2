import { PackageIcon, GavelIcon, ClockIcon, DollarSignIcon } from "lucide-react"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  totalBarang: number;
  lelangAktif: number;
  menungguPembayaran: number;
  totalPendapatan: number;
}

export function SectionCards({
    totalBarang,
    lelangAktif,
    menungguPembayaran,
    totalPendapatan
}: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Barang</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {totalBarang}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <PackageIcon className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground text-xs text-balance">
            Total semua barang terdaftar
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Lelang Aktif</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {lelangAktif}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <GavelIcon className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground text-xs text-balance">
            Barang yang saat ini dilelang
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Menunggu Pembayaran</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {menungguPembayaran}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <ClockIcon className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground text-xs text-balance">
            Lelang selesai, proses bayar
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Pendapatan</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            Rp {new Intl.NumberFormat('id-ID').format(totalPendapatan)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <DollarSignIcon className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground text-xs text-balance">
            Transaksi lelang lunas
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
