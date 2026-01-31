"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X } from "lucide-react";
import { Barang } from "@/api/barang";

interface BarangFormProps {
    initialData?: Barang;
}

export function BarangForm({ initialData }: BarangFormProps) {
    const [namaBarang, setNamaBarang] = useState(initialData?.nama || "");
    const [hargaAwal, setHargaAwal] = useState(initialData?.harga_awal?.toString() || "");
    const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi_barang || "");

    // State to handle new images (File objects)
    const [newImages, setNewImages] = useState<File[]>([]);

    // State to handle existing images (URL strings)
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.image_urls || []);

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Helper to format number with dots
    const formatCurrency = (value: string) => {
        const number = value.replace(/\D/g, ""); // Remove non-digits
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\./g, "");
        if (!isNaN(Number(rawValue))) {
            const formatted = formatCurrency(rawValue);
            setHargaAwal(formatted);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewImages((prev) => [...prev, ...files]);
        }
    };

    const removeNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const supabase = createClient();
            const imageUrls: string[] = [...existingImages];

            // 1. Upload New Images
            for (const image of newImages) {
                const fileExt = image.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('barang')
                    .upload(filePath, image);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('barang')
                    .getPublicUrl(filePath);

                imageUrls.push(publicUrlData.publicUrl);
            }

            const payload = {
                nama: namaBarang,
                // tgl: new Date().toISOString().split('T')[0], // Don't update date ideally, or keep original
                harga_awal: parseInt(hargaAwal.replace(/\./g, "")),
                deskripsi_barang: deskripsi,
                image_urls: imageUrls
            };

            if (initialData?.id) {
                // UPDATE
                const { error } = await supabase
                    .from('tb_barang')
                    .update(payload)
                    .eq('id', initialData.id);

                if (error) throw error;
                toast.success("Barang berhasil diperbarui");
            } else {
                // INSERT
                const insertPayload = {
                    ...payload,
                    tanggal: new Date().toISOString().split('T')[0], // Set date only on create
                };
                const { error } = await supabase
                    .from('tb_barang')
                    .insert(insertPayload);

                if (error) throw error;
                toast.success("Barang berhasil ditambahkan");
            }

            router.back();
            router.refresh();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Gagal menyimpan barang");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{initialData ? "Edit Barang" : "Form Tambah Barang"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nama_barang">Nama Barang</Label>
                        <Input
                            id="nama_barang"
                            value={namaBarang}
                            onChange={(e) => setNamaBarang(e.target.value)}
                            required
                            placeholder="Contoh: Laptop Gaming"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="harga_awal">Harga Awal (Rp)</Label>
                        <Input
                            id="harga_awal"
                            type="text"
                            value={hargaAwal}
                            onChange={handleHargaChange}
                            required
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deskripsi">Deskripsi Barang</Label>
                        <Textarea
                            id="deskripsi"
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            required
                            placeholder="Deskripsi detail barang..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Foto Barang</Label>

                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div className="mb-2">
                                <p className="text-sm font-medium mb-2">Foto Saat Ini:</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {existingImages.map((url, index) => (
                                        <div key={`existing-${index}`} className="relative group aspect-square rounded-md overflow-hidden border">
                                            <img
                                                src={url}
                                                alt={`Existing ${index}`}
                                                className="object-cover w-full h-full"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Images */}
                        <div className="grid grid-cols-3 gap-4 mb-2">
                            {newImages.map((img, index) => (
                                <div key={`new-${index}`} className="relative group aspect-square rounded-md overflow-hidden border">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`Preview ${index}`}
                                        className="object-cover w-full h-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <label className="flex flex-col items-center justify-center aspect-square rounded-md border border-dashed hover:bg-muted/50 cursor-pointer transition-colors">
                                <Plus className="h-8 w-8 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground mt-2">Tambah Foto</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Format: PNG, JPG, JPEG. Bisa upload lebih dari satu.
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            initialData ? "Simpan Perubahan" : "Simpan Barang"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
