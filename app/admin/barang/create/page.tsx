'use client'

import { SiteHeader } from "@/components/site-header"
import { BarangForm } from "@/components/barang-form"

export default function CreateBarangPage() {
    return (
        <>
            <SiteHeader title={'Tambah Barang'} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <BarangForm />
            </div>
        </>
    )
}
