import { SiteHeader } from "@/components/site-header"

export default function BarangPage() {
    return (
        <>
            <SiteHeader />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold">Pendataan Barang</h1>
                    <p className="text-muted-foreground">Kelola data barang lelang</p>
                </div>
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Halaman daftar barang akan ditampilkan di sini.
                    </p>
                </div>
            </div>
        </>
    )
}
