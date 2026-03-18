import { SiteHeader } from "@/components/site-header";
import { BarangForm } from "@/components/barang-form";
import { getBarangById } from "@/api/barang";
import { notFound } from "next/navigation";

export default async function EditBarangPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const idNumber = parseInt(id);

    if (isNaN(idNumber)) {
        notFound();
    }

    try {
        const barang = await getBarangById(idNumber);

        if (!barang) {
            notFound();
        }

        return (
            <>
                <SiteHeader title={'Edit Barang'} />
                <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                    <BarangForm initialData={barang} />
                </div>
            </>
        );
    } catch (error) {
        console.error("Error loading barang for edit:", error);
        notFound();
    }
}