'use client'

import { BarangTable } from "@/components/barang-table"

export default function BarangPage() {
    return (
        <div className="px-4 lg:px-6 py-5">
            <h1 className="text-2xl font-bold tracking-tight mb-3">Daftar Barang</h1>
            <BarangTable />
        </div>
    )
}