'use client'

import { SiteHeader } from "@/components/site-header"
import Link from "next/link"
import { Gavel, ReceiptText, Package, ChevronRight } from "lucide-react"

export default function LaporanPage() {
    const reportLinks = [
        {
            title: "Laporan Lelang",
            description: "Laporan aktivitas lelang dan statistik penawaran",
            href: "/petugas/laporan/lelang",
            icon: <Gavel className="h-6 w-6 text-blue-500" />,
            color: "bg-blue-50/50 dark:bg-blue-900/10",
        },
        {
            title: "Laporan Pembayaran",
            description: "Laporan transaksi pembayaran dan status pelunasan",
            href: "/petugas/laporan/pembayaran",
            icon: <ReceiptText className="h-6 w-6 text-emerald-500" />,
            color: "bg-emerald-50/50 dark:bg-emerald-900/10",
        },
        {
            title: "Laporan Barang",
            description: "Laporan inventori barang dan status aset",
            href: "/petugas/laporan/barang",
            icon: <Package className="h-6 w-6 text-purple-500" />,
            color: "bg-purple-50/50 dark:bg-purple-900/10",
        },
    ]

    return (
        <>
            <SiteHeader title="Laporan" />
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Laporan</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Generate dan analisis data operasional sistem lelang dengan filter yang fleksibel.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {reportLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="group">
                            <div className="relative h-full overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                <div className={`inline-flex items-center justify-center rounded-xl p-3 mb-6 transition-transform group-hover:scale-110 duration-300 ${link.color}`}>
                                    {link.icon}
                                </div>
                                
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 group-hover:text-primary transition-colors">
                                        {link.title}
                                        <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {link.description}
                                    </p>
                                </div>

                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    {link.icon}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}
