'use client'

import { SiteHeader } from "@/components/site-header"

export default function PembayaranPage() {
    return (
        <>
            <SiteHeader title={'Validasi Pembayaran'} / >
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold">Validasi Pembayaran</h1>
                    <p className="text-muted-foreground">Verifikasi bukti pembayaran dari pemenang lelang</p>
                </div>
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Daftar pembayaran yang perlu divalidasi akan ditampilkan di sini.
                    </p>
                </div>
            </div>
        </>
    )
}
