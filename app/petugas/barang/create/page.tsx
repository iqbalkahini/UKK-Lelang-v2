'use client'

import { SiteHeader } from "@/components/site-header"

export default function CreateBarangPage() {
    return (
        <>
            <SiteHeader title={'Tambah Barang'} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div>
                    <h1 className="text-3xl font-bold">Tambah Barang</h1>
                </div>
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Form tambah barang akan ditampilkan di sini.
                    </p>
                </div>
            </div>
        </>
    )
}
