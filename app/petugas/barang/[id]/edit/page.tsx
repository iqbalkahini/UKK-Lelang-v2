"use client";

import { BarangForm } from "@/components/barang-form";
import { getBarangById, type Barang } from "@/api/barang";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

export default function EditBarangPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const idNumber = parseInt(id);
    const router = useRouter();
    
    const [barang, setBarang] = useState<Barang | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isNaN(idNumber)) {
            notFound();
            return;
        }

        const fetchBarang = async () => {
            try {
                const data = await getBarangById(idNumber);
                if (!data) {
                    notFound();
                    return;
                }
                setBarang(data);
            } catch (error) {
                console.error("Error loading barang for edit:", error);
                toast.error("Gagal memuat data barang");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBarang();
    }, [idNumber]);

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!barang) {
        return null; // or show specific error
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <BarangForm 
                initialData={barang} 
                onCancel={() => router.push('/petugas/barang')} 
            />
        </div>
    );
}