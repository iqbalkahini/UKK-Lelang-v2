import { SiteHeader } from "@/components/site-header"
import { BarangForm } from "@/components/barang-form"
import { getBarangById } from "@/api/barang"
import { notFound } from "next/navigation"

export default async function EditBarangPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) notFound()

    let barang = null
    try {
        barang = await getBarangById(id)
    } catch (error) {
        console.error("Error fetching barang:", error)
        notFound()
    }

    if (!barang) notFound()

    return (
        <>
            <SiteHeader title={`Edit Barang #${barang.id}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <BarangForm initialData={barang} />
            </div>
        </>
    )
}
