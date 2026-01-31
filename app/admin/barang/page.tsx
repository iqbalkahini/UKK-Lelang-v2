import { SiteHeader } from "@/components/site-header"
import { BarangTable } from "@/components/barang-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function BarangPage() {
    return (
        <>
            <SiteHeader title={'Daftar Barang'} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Pendataan Barang</h1>
                        <p className="text-muted-foreground">Kelola data barang lelang</p>
                    </div>
                    <Link href="/admin/barang/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Barang
                        </Button>
                    </Link>
                </div>
                <BarangTable basePath="/admin/barang" />
            </div>
        </>
    )
}
