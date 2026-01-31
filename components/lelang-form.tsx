"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getBarang, getBarangById, type Barang } from "@/api/barang";
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
import { CalendarIcon, Check, ChevronsUpDown, Clock2Icon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";

type LelangFormProps = {
    initialData?: {
        barang_id?: number;
        tgl_lelang?: string;
        waktu_mulai?: string;
        waktu_selesai?: string;
        status?: "dibuka" | "ditutup" | "pending";
    };
    onSubmit: (data: {
        barang_id: number;
        tgl_lelang: string;
        waktu_mulai: string;
        waktu_selesai: string;
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
    // Defines
    const ITEMS_PER_PAGE = 10;

    // Form State
    const [formData, setFormData] = useState({
        id_barang: initialData?.barang_id?.toString() || "",
        tgl_lelang: initialData?.tgl_lelang
            ? new Date(initialData.tgl_lelang).toISOString().slice(0, 10)
            : "",
        waktu_mulai: initialData?.waktu_mulai || "",
        waktu_selesai: initialData?.waktu_selesai || "",
        status: initialData?.status || ("pending" as "dibuka" | "ditutup" | "pending"),
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Combobox State
    const [open, setOpen] = useState(false);
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
    const [isLoadingBarang, setIsLoadingBarang] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Observer for infinite scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastBarangElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoadingBarang || !hasMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoadingBarang, hasMore]);

    // Fetch Barang List (Search & Pagination)
    useEffect(() => {
        const fetchBarangList = async () => {
            setIsLoadingBarang(true);
            try {
                const result = await getBarang(page, ITEMS_PER_PAGE, searchQuery);

                setBarangList(prev => {
                    if (page === 1) return result.data;
                    // Filter duplicates just in case
                    const newData = result.data.filter(item => !prev.some(p => p.id === item.id));
                    return [...prev, ...newData];
                });

                setHasMore(result.data.length === ITEMS_PER_PAGE);
                console.log(result.data);
            } catch (error) {
                console.error("Error fetching barang list:", error);
                toast.error("Gagal mengambil data barang");
            } finally {
                setIsLoadingBarang(false);
            }
        };

        // Debounce search if it changed, otherwise normal fetch
        const timeoutId = setTimeout(() => {
            fetchBarangList();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [page, searchQuery]);

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1);
        // Do NOT clear list here immediately to avoid flickering, let the fetch replace it.
        // But if we don't clear, append logic might mess up if the fetch is slow.
        // Ideally we handle 'page 1' logic in the fetch effect carefully.
        // Actually, clearing list is safer for UI feedback.
        if (page === 1) {
            // If we are already at page 1, the effect above will run.
            // If we were at page > 1, setting page to 1 will trigger effect.
        }
    }, [searchQuery]);

    // Fetch Selected Barang Detail (Initial Load)
    useEffect(() => {
        const fetchSelectedBarang = async () => {
            if (formData.id_barang && !selectedBarang) {
                // Check if already in list
                const inList = barangList.find(b => b.id.toString() === formData.id_barang);
                if (inList) {
                    setSelectedBarang(inList);
                    return;
                }

                // If not in list, fetch details
                try {
                    const data = await getBarangById(parseInt(formData.id_barang));
                    setSelectedBarang(data);
                } catch (error) {
                    console.error("Error fetching selected barang:", error);
                }
            } else if (selectedBarang && selectedBarang.id.toString() !== formData.id_barang) {
                // Update selected barang from list if ID changes manually (unlikely but good for safety)
                const inList = barangList.find(b => b.id.toString() === formData.id_barang);
                if (inList) setSelectedBarang(inList);
            }
        };

        fetchSelectedBarang();
    }, [formData.id_barang, barangList, selectedBarang]);


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

        if (!formData.waktu_mulai) {
            toast.error("Waktu mulai harus diisi");
            return;
        }

        if (!formData.waktu_selesai) {
            toast.error("Waktu selesai harus diisi");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                barang_id: parseInt(formData.id_barang),
                tgl_lelang: new Date(formData.tgl_lelang).toISOString(),
                waktu_mulai: formData.waktu_mulai,
                waktu_selesai: formData.waktu_selesai,
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
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {/* Prefer selectedBarang for name, otherwise fallback to finding in list, otherwise placeholder */}
                            {selectedBarang
                                ? selectedBarang.nama
                                : (formData.id_barang
                                    ? "Memuat..."
                                    : "Pilih barang...")}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Cari barang..."
                                value={searchQuery}
                                onValueChange={(val) => {
                                    setSearchQuery(val);
                                    // Reset page when search changes
                                    setPage(1);
                                }}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    {isLoadingBarang ? "Memuat..." : "Barang tidak ditemukan."}
                                </CommandEmpty>
                                <CommandGroup>
                                    {barangList.map((barang) => (
                                        <CommandItem
                                            key={barang.id}
                                            value={barang.nama}
                                            onSelect={() => {
                                                setFormData({ ...formData, id_barang: barang.id.toString() });
                                                setSelectedBarang(barang);
                                                setOpen(false);
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

                                    {/* Sentinel for infinite scroll */}
                                    <div ref={lastBarangElementRef} className="h-2 w-full" />

                                    {isLoadingBarang && page > 1 && (
                                        <div className="py-2 text-center text-xs text-muted-foreground">
                                            Memuat lebih banyak...
                                        </div>
                                    )}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Tanggal & Waktu Lelang */}
            <div className="space-y-2 flex flex-col">
                <Label>Jadwal Lelang</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !formData.tgl_lelang && "text-muted-foreground"
                            )}
                        >
                            {formData.tgl_lelang ? (
                                <>
                                    {new Date(formData.tgl_lelang).toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                    {formData.waktu_mulai && formData.waktu_selesai ? ` • ${formData.waktu_mulai} - ${formData.waktu_selesai}` : ""}
                                </>
                            ) : (
                                <span>Pilih tanggal dan waktu</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 max-h-[80vh] overflow-y-auto" align="start">
                        <Card className="border-0 shadow-none flex pt-4">
                            <CardContent>
                                <Calendar
                                    mode="single"
                                    selected={
                                        formData.tgl_lelang
                                            ? new Date(formData.tgl_lelang + "T00:00:00")
                                            : undefined
                                    }
                                    onSelect={(date) => {
                                        if (date) {
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, "0");
                                            const day = String(date.getDate()).padStart(2, "0");
                                            setFormData({ ...formData, tgl_lelang: `${year}-${month}-${day}` });
                                        } else {
                                            setFormData({ ...formData, tgl_lelang: "" });
                                        }
                                    }}
                                    className="p-0"
                                />
                            </CardContent>
                            <CardFooter className="bg-card border-l">
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="waktu_mulai">Waktu Mulai</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="waktu_mulai"
                                                type="time"
                                                value={formData.waktu_mulai}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, waktu_mulai: e.target.value })
                                                }
                                                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
                                            />
                                            <InputGroupAddon>
                                                <Clock2Icon className="text-muted-foreground h-4 w-4" />
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="waktu_selesai">Waktu Selesai</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="waktu_selesai"
                                                type="time"
                                                value={formData.waktu_selesai}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, waktu_selesai: e.target.value })
                                                }
                                                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
                                            />
                                            <InputGroupAddon>
                                                <Clock2Icon className="text-muted-foreground h-4 w-4" />
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Field>
                                </FieldGroup>
                            </CardFooter>
                        </Card>
                    </PopoverContent>
                </Popover>
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
