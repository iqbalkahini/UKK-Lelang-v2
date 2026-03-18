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
import { Loader2, Plus, X, Image as ImageIcon } from "lucide-react";
import { Barang } from "@/api/barang";
import { cn } from "@/lib/utils";

interface BarangFormProps {
    initialData?: Barang;
    onCancel?: () => void;
}

export function BarangForm({ initialData, onCancel }: BarangFormProps) {
    const [namaBarang, setNamaBarang] = useState(initialData?.nama || "");
    const [hargaAwal, setHargaAwal] = useState(initialData?.harga_awal?.toString() || "");
    const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi_barang || "");
    const [newImages, setNewImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.image_urls || []);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const formatCurrency = (value: string) => {
        const number = value.replace(/\D/g, "");
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\./g, "");
        if (!isNaN(Number(rawValue))) {
            setHargaAwal(formatCurrency(rawValue));
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

            for (const image of newImages) {
                const fileExt = image.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('barang')
                    .upload(fileName, image);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('barang')
                    .getPublicUrl(fileName);

                imageUrls.push(publicUrlData.publicUrl);
            }

            const payload = {
                nama: namaBarang,
                harga_awal: parseInt(hargaAwal.replace(/\./g, "")),
                deskripsi_barang: deskripsi,
                image_urls: imageUrls
            };

            if (initialData?.id) {
                const { error } = await supabase
                    .from('tb_barang')
                    .update(payload)
                    .eq('id', initialData.id);

                if (error) throw error;
                toast.success("Barang berhasil diperbarui");
            } else {
                const { error } = await supabase
                    .from('tb_barang')
                    .insert({ ...payload, tanggal: new Date().toISOString().split('T')[0] });

                if (error) throw error;
                toast.success("Barang berhasil ditambahkan");
            }

            if (onCancel) onCancel();
            else {
                router.back();
                router.refresh();
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Gagal menyimpan barang");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-xl font-semibold">
                    {initialData ? "Edit Barang" : "Tambah Barang Baru"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Lengkapi informasi detail barang di bawah ini.
                </p>
            </CardHeader>
            <CardContent className="px-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column: Basic Info */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama_barang" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                    Nama Barang
                                </Label>
                                <Input
                                    id="nama_barang"
                                    value={namaBarang}
                                    onChange={(e) => setNamaBarang(e.target.value)}
                                    required
                                    placeholder="Masukkan nama barang"
                                    className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="harga_awal" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                    Harga Awal (Rp)
                                </Label>
                                <Input
                                    id="harga_awal"
                                    type="text"
                                    value={hargaAwal}
                                    onChange={handleHargaChange}
                                    required
                                    placeholder="0"
                                    className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deskripsi" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                    Deskripsi Barang
                                </Label>
                                <Textarea
                                    id="deskripsi"
                                    value={deskripsi}
                                    onChange={(e) => setDeskripsi(e.target.value)}
                                    required
                                    placeholder="Berikan deskripsi singkat..."
                                    className="min-h-[120px] bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors resize-none"
                                />
                            </div>
                        </div>

                        {/* Right Column: Images */}
                        <div className="space-y-4">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                                <ImageIcon size={14} />
                                Foto Barang
                            </Label>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {/* Existing Images */}
                                {existingImages.map((url, index) => (
                                    <div key={`existing-${index}`} className="group relative aspect-square rounded-lg overflow-hidden border bg-muted/30">
                                        <img src={url} alt="" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute top-1.5 right-1.5 bg-background/80 hover:bg-red-500 hover:text-white backdrop-blur-sm rounded-md p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* New Images */}
                                {newImages.map((img, index) => (
                                    <div key={`new-${index}`} className="group relative aspect-square rounded-lg overflow-hidden border bg-muted/30">
                                        <img src={URL.createObjectURL(img)} alt="" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute top-1.5 right-1.5 bg-background/80 hover:bg-red-500 hover:text-white backdrop-blur-sm rounded-md p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* Add Button */}
                                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group">
                                    <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground group-hover:text-primary mt-1">Tambah Foto</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">
                                * Unggah foto dari berbagai sudut untuk hasil terbaik.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-muted-foreground/10">
                        <Button type="submit" className="flex-1 shadow-lg shadow-primary/20" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                initialData ? "Simpan Perubahan" : "Tambah Barang"
                            )}
                        </Button>
                        {onCancel && (
                            <Button type="button" variant="ghost" className="px-6 hover:bg-red-500/10 hover:text-red-500 transition-colors" onClick={onCancel}>
                                Batal
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
