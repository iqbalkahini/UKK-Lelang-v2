import { SiteHeader } from "@/components/site-header"
import Link from "next/link"

export default function PembayaranPage() {
    return (
        <>
            <SiteHeader title={'Pembayaran'} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold">Pembayaran</h1>
                    <p className="text-muted-foreground">Kelola pembayaran lelang Anda</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Link href="/masyarakat/pembayaran/wins">
                        <div className="rounded-lg border p-6 hover:bg-accent cursor-pointer transition-colors">
                            <h3 className="font-semibold mb-2">Menang Lelang</h3>
                            <p className="text-sm text-muted-foreground">Lelang yang Anda menangkan</p>
                        </div>
                    </Link>
                    <Link href="/masyarakat/pembayaran/history">
                        <div className="rounded-lg border p-6 hover:bg-accent cursor-pointer transition-colors">
                            <h3 className="font-semibold mb-2">Riwayat Pembayaran</h3>
                            <p className="text-sm text-muted-foreground">Riwayat transaksi pembayaran</p>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    )
}
