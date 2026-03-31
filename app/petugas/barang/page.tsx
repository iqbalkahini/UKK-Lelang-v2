'use client'

import { BarangTable } from "@/components/barang-table"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function BarangPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader title="Pendataan Barang" />
            <div className="flex-1 px-4 lg:px-6 py-5">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Daftar Barang</h1>
                        <p className="text-muted-foreground">
                            Kelola semua data barang lelang yang tersedia
                        </p>
                    </div>
                    <Link href="/petugas/barang/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Barang
                        </Button>
                    </Link>
                </div>
                <BarangTable />
            </div>
        </div>
    )
}