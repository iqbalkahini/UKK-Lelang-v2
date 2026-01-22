'use client'

import { Barang, getBarangById } from "@/api/barang"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { CalendarIcon, TagIcon, PackageIcon } from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import { useParams } from "next/navigation"

export default function CardBarang() {
    const { id } = useParams()
    const [data, setData] = useState<Barang | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetching = async () => {
        setIsLoading(true)
        try {
            const result = await getBarangById(Number(id))
            setData(result)
        } catch (error) {
            toast.error("Gagal mengambil data barang")
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetching()
    }, [id])

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <Card className="w-full overflow-hidden">
                <CardHeader className="relative pb-4">
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!data) {
        return (
            <Card className="w-full">
                <CardContent className="flex items-center justify-center h-40">
                    <p className="text-muted-foreground">Data tidak ditemukan</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent blur-3xl -z-10" />

            <CardHeader className="relative pb-4 space-y-1">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {data.nama}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-sm">
                            <PackageIcon className="h-4 w-4" />
                            ID: {data.id}
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-lg font-semibold px-3 py-1.5 whitespace-nowrap">
                        <TagIcon className="h-4 w-4 mr-1.5" />
                        {formatCurrency(data.harga_awal)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Tanggal */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-l-2 border-primary/50 pl-3 py-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDate(data.tanggal)}</span>
                </div>

                {/* Deskripsi */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Deskripsi
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground/90 bg-muted/30 rounded-lg p-4 border border-border/50">
                        {data.deskripsi_barang}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}