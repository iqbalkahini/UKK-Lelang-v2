import { SiteHeader } from "@/components/site-header"

export default function PenawaranPage() {
    return (
        <>
            <SiteHeader />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold">Penawaran Saya</h1>
                    <p className="text-muted-foreground">Riwayat penawaran yang telah Anda lakukan</p>
                </div>
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Daftar penawaran Anda akan ditampilkan di sini.
                    </p>
                </div>
            </div>
        </>
    )
}
