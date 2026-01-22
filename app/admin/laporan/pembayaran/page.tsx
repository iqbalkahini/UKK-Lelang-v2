import { SiteHeader } from "@/components/site-header"

export default function LaporanPembayaranPage() {
    return (
        <>
            <SiteHeader />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold">Laporan Pembayaran</h1>
                    <p className="text-muted-foreground">Laporan transaksi dan pembayaran</p>
                </div>
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Filter dan generate laporan pembayaran akan ditampilkan di sini.
                    </p>
                </div>
            </div>
        </>
    )
}
