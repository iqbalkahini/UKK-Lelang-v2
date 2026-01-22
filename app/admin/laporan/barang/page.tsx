import { SiteHeader } from "@/components/site-header"

export default function LaporanBarangPage() {
    return (
        <>
            <SiteHeader />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold">Laporan Barang</h1>
                    <p className="text-muted-foreground">Laporan inventori dan status barang</p>
                </div>
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Filter dan generate laporan barang akan ditampilkan di sini.
                    </p>
                </div>
            </div>
        </>
    )
}
