"use client";

import { useState, useEffect } from "react";
import { getBarang, type Barang } from "@/api/barang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LelangFormProps = {
    initialData?: {
        barang_id?: number;
        tgl_lelang?: string;
        status?: "dibuka" | "ditutup" | "pending";
    };
    onSubmit: (data: {
        barang_id: number;
        tgl_lelang: string;
        status: "dibuka" | "ditutup" | "pending";
    }) => Promise<void>;
    onCancel?: () => void;
    submitLabel?: string;
};

export function LelangForm({
    initialData,
    onSubmit,
    onCancel,
    submitLabel = "Simpan",
}: LelangFormProps) {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [isLoadingBarang, setIsLoadingBarang] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    const [formData, setFormData] = useState({
        id_barang: initialData?.barang_id?.toString() || "",
        tgl_lelang: initialData?.tgl_lelang
            ? new Date(initialData.tgl_lelang).toISOString().slice(0, 16)
            : "",
        status: initialData?.status || ("pending" as "dibuka" | "ditutup" | "pending"),
    });

    useEffect(() => {
        const fetchBarang = async () => {
            try {
                const result = await getBarang(1, 1000); // Get all barang
                setBarangList(result.data);
            } catch (error) {
                console.error("Error fetching barang:", error);
                toast.error("Gagal mengambil data barang");
            } finally {
                setIsLoadingBarang(false);
            }
        };

        fetchBarang();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.id_barang) {
            toast.error("Pilih barang terlebih dahulu");
            return;
        }

        if (!formData.tgl_lelang) {
            toast.error("Tanggal lelang harus diisi");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                barang_id: parseInt(formData.id_barang),
                tgl_lelang: new Date(formData.tgl_lelang).toISOString(),
                status: formData.status,
            });
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Gagal menyimpan data lelang");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Barang Selection */}
            <div className="space-y-2 flex flex-col">
                <Label htmlFor="id_barang">Barang</Label>
                {isLoadingBarang ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memuat data barang...
                    </div>
                ) : (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between"
                            >
                                {formData.id_barang
                                    ? barangList.find((barang) => barang.id.toString() === formData.id_barang)?.nama
                                    : "Pilih barang..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Cari barang..." />
                                <CommandList>
                                    <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                        {barangList.map((barang) => (
                                            <CommandItem
                                                key={barang.id}
                                                value={barang.nama}
                                                onSelect={() => {
                                                    setFormData({ ...formData, id_barang: barang.id.toString() })
                                                    setOpen(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        formData.id_barang === barang.id.toString() ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {barang.nama} - Rp {barang.harga_awal.toLocaleString("id-ID")}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            {/* Tanggal Lelang */}
            <div className="space-y-2">
                <Label htmlFor="tanggal_lelang">Tanggal & Waktu Lelang</Label>
                <Input
                    id="tanggal_lelang"
                    type="datetime-local"
                    value={formData.tgl_lelang}
                    onChange={(e) =>
                        setFormData({ ...formData, tgl_lelang: e.target.value })
                    }
                    required
                />
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                    value={formData.status}
                    onValueChange={(value: "dibuka" | "ditutup" | "pending") =>
                        setFormData({ ...formData, status: value })
                    }
                >
                    <SelectTrigger id="status">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="dibuka">Dibuka</SelectItem>
                        <SelectItem value="ditutup">Ditutup</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting || isLoadingBarang}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        submitLabel
                    )}
                </Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Batal
                    </Button>
                )}
            </div>
        </form>
    );
}
