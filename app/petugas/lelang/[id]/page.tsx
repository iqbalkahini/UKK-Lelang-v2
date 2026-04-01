import { getLelangById } from "@/api/lelang";
import { LelangDetailContent } from "./lelang-detail-content";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DetailLelangPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const lelangId = parseInt(id);

    if (isNaN(lelangId)) {
        return notFound();
    }

    const lelang = await getLelangById(lelangId);

    if (!lelang) {
        return (
            <div className="px-4 lg:px-6 py-5 space-y-6">
                <div className="mb-6">
                    <Link href={`/petugas/lelang`}>
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Daftar
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Lelang Tidak Ditemukan
                    </h1>
                    <p className="text-muted-foreground text-destructive">
                        Data lelang dengan ID #{id} tidak dapat ditemukan.
                    </p>
                </div>
            </div>
        );
    }

    return <LelangDetailContent id={id} lelang={lelang} />;
}
