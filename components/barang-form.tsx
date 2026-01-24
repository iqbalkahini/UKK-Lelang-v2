"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Removed as component missing
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X } from "lucide-react";

export function BarangForm() {
    const [namaBarang, setNamaBarang] = useState("");
    // const [tgl, setTgl] = useState(new Date().toISOString().split('T')[0]); // Removed: Auto-set on submit
    const [hargaAwal, setHargaAwal] = useState("");

    // Helper to format number with dots
    const formatCurrency = (value: string) => {
        const number = value.replace(/\D/g, ""); // Remove non-digits
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCurrency(e.target.value);
        setHargaAwal(formatted);
    };
    const [deskripsi, setDeskripsi] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            setImages((prev) => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const supabase = createClient();
            const imageUrls: string[] = [];

            // 1. Upload Images
            for (const image of images) {
                const fileExt = image.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('barang') // Ensure this bucket exists
                    .upload(filePath, image);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('barang')
                    .getPublicUrl(filePath);

                imageUrls.push(publicUrlData.publicUrl);
            }

            // 2. Insert Data
            const { error: insertError } = await supabase
                .from('tb_barang')
                .insert({
                    nama: namaBarang,
                    tanggal : new Date().toISOString().split('T')[0], // Auto-set to today
                    harga_awal: parseInt(hargaAwal.replace(/\./g, "")), // Remove dots before sending
                    deskripsi_barang: deskripsi,
                    image_urls: imageUrls // Assuming this column exists as requested
                });

            if (insertError) throw insertError;

            toast.success("Barang berhasil ditambahkan");
            router.back();
            router.refresh();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Gagal menambahkan barang");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Form Tambah Barang</CardTitle>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* <div className="space-y-2">
                            <Label htmlFor="tgl">Tanggal</Label>
                            <Input
                                id="tgl"
                                type="date"
                                value={tgl}
                                onChange={(e) => setTgl(e.target.value)}
                                required
                            />
                        </div> */}
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
                        <div className="grid grid-cols-3 gap-4 mb-2">
                            {images.map((img, index) => (
                                <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`Preview ${index}`}
                                        className="object-cover w-full h-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
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
                            "Simpan Barang"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
