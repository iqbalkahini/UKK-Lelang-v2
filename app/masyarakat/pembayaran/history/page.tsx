'use client'

import { SiteHeader } from "@/components/site-header"

export default function PaymentHistoryPage() {
    return (
        <>
            <SiteHeader title={'Riwayat Pembayaran'} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold">Riwayat Pembayaran</h1>
                    <p className="text-muted-foreground">Histori transaksi pembayaran yang telah selesai</p>
                </div>
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Riwayat pembayaran Anda akan ditampilkan di sini.
                    </p>
                </div>
            </div>
        </>
    )
}
