'use client'

import { SiteHeader } from "@/components/site-header"
import Link from "next/link"

export default function LaporanPage() {
    return (
        <>
            <SiteHeader title={'Laporan'} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold">Laporan</h1>
                    <p className="text-muted-foreground">Generate dan lihat laporan sistem</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Link href="/petugas/laporan/lelang">
                        <div className="rounded-lg border p-6 hover:bg-accent cursor-pointer transition-colors">
                            <h3 className="font-semibold mb-2">Laporan Lelang</h3>
                            <p className="text-sm text-muted-foreground">Laporan aktivitas lelang</p>
                        </div>
                    </Link>
                    <Link href="/petugas/laporan/pembayaran">
                        <div className="rounded-lg border p-6 hover:bg-accent cursor-pointer transition-colors">
                            <h3 className="font-semibold mb-2">Laporan Pembayaran</h3>
                            <p className="text-sm text-muted-foreground">Laporan transaksi pembayaran</p>
                        </div>
                    </Link>
                    <Link href="/petugas/laporan/barang">
                        <div className="rounded-lg border p-6 hover:bg-accent cursor-pointer transition-colors">
                            <h3 className="font-semibold mb-2">Laporan Barang</h3>
                            <p className="text-sm text-muted-foreground">Laporan inventori barang</p>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    )
}
