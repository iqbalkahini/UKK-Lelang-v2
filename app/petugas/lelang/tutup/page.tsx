'use client'

import { SiteHeader } from "@/components/site-header"

export default function TutupLelangPage() {
    return (
        <>
            <SiteHeader title={'Tutup Lelang'} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold">Tutup Lelang</h1>
                    <p className="text-muted-foreground">Tutup lelang dan tentukan pemenang</p>
                </div>
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Daftar lelang aktif yang bisa ditutup akan ditampilkan di sini.
                    </p>
                </div>
            </div>
        </>
    )
}
