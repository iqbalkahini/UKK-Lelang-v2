'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calendar, Tag, Pencil } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

interface Barang {
    id: number
    nama: string
    tanggal: string
    harga_awal: number
    deskripsi_barang: string
    image_urls: string[] | null
}

export default function DetailBarangPage() {
    const params = useParams()
    const router = useRouter()
    const [barang, setBarang] = useState<Barang | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const rawId = params?.id
    const id = Array.isArray(rawId) ? rawId[0] : rawId

    useEffect(() => {
        if (!id) return

        const numericId = Number(id)

        if (isNaN(numericId)) {
            console.warn("ID tidak valid terdeteksi:", id)
            setLoading(false)
            return
        }

        const fetchBarang = async () => {
            try {
                setLoading(true)
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('tb_barang')
                    .select('*')
                    .eq('id', numericId)
                    .single()

                if (error) throw error

                setBarang(data)
                if (data.image_urls && data.image_urls.length > 0) {
                    setSelectedImage(data.image_urls[0])
                }
            } catch (error) {
                console.error('Error fetching barang:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchBarang()
    }, [id])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <>
                <SiteHeader title="Detail Barang" />
                <div className="container mx-auto p-4 md:p-6 space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <div className="grid md:grid-cols-2 gap-8">
                        <Skeleton className="h-[400px] w-full rounded-xl" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if (!barang) {
        return (
            <>
                <SiteHeader title="Detail Barang" />
                <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <h2 className="text-2xl font-bold mb-2">Barang tidak ditemukan</h2>
                    <p className="text-muted-foreground mb-4">Mungkin ID barang salah atau barang sudah dihapus.</p>
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Button>
                </div>
            </>
        )
    }

    const displayImage = selectedImage || "/placeholder-image.jpg"

    return (
        <>
            <SiteHeader title={`Detail Barang #${barang.id}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <Link href="/admin/barang" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors w-fit">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Daftar Barang
                </Link>

                <div className="grid md:grid-cols-12 gap-8 max-w-6xl mx-auto w-full">
                    {/* Left Column: Image Gallery */}
                    <div className="md:col-span-7 flex flex-col gap-4">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted">
                            <img
                                src={displayImage}
                                alt={barang.nama}
                                className="object-cover w-full h-full transition-all duration-300 hover:scale-105"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image'
                                }}
                            />
                        </div>

                        {/* Thumbnails */}
                        {barang.image_urls && barang.image_urls.length > 0 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {barang.image_urls.map((url, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(url)}
                                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === url
                                            ? "border-primary ring-2 ring-primary/20"
                                            : "border-transparent opacity-70 hover:opacity-100"
                                            }`}
                                    >
                                        <img
                                            src={url}
                                            alt={`${barang.nama} ${index + 1}`}
                                            className="object-cover w-full h-full"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details */}
                    <div className="md:col-span-5 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                                {barang.nama}
                            </h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">Terdaftar sejak {formatDate(barang.tanggal)}</span>
                            </div>
                        </div>

                        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-1 mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Harga Awal</span>
                                    <div className="text-3xl font-bold text-primary flex items-baseline gap-1">
                                        {formatCurrency(barang.harga_awal)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Tag className="h-5 w-5" />
                                Deskripsi Barang
                            </h3>
                            <div className="prose prose-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                {barang.deskripsi_barang}
                            </div>
                        </div>

                        <div className="pt-6 border-t">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                                    <span className="text-xs text-muted-foreground uppercase font-bold">Total Foto</span>
                                    <span className="font-medium">{barang.image_urls?.length || 0} Foto</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Link href={`/admin/barang/${barang.id}/edit`} className="w-full">
                                <Button className="w-full h-12 text-lg">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Barang
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
