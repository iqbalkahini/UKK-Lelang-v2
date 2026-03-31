"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getAvailableBarang, type Barang } from "@/api/barang";
import { getLelangBarangIds } from "@/api/lelang";
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
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Loader2, Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type LelangFormProps = {
  initialData?: {
    barang_id?: number;
    tgl_lelang?: string;
    waktu_mulai: string;
    waktu_selesai: string;
    status: "dibuka" | "ditutup" | "pending" | "dibayar";
    is_manual: boolean;
  };
  onSubmit: (data: {
    barang_id: number;
    tgl_lelang: string;
    waktu_mulai: string;
    waktu_selesai: string;
    status: "dibuka" | "ditutup" | "pending" | "dibayar";
    is_manual: boolean;
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
  
  // Infinite Scroll & Search States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [lelangIds, setLelangIds] = useState<number[]>([]);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingBarang || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoadingBarang, isFetchingMore, hasMore]);

  type LelangFormData = {
    id_barang: string;
    tgl_lelang: string;
    waktu_mulai: string;
    waktu_selesai: string;
    status: "dibuka" | "ditutup" | "pending" | "dibayar";
    is_manual: boolean;
  };

  const [formData, setFormData] = useState<LelangFormData>({
    id_barang: initialData?.barang_id?.toString() || "",
    tgl_lelang: initialData?.tgl_lelang
      ? new Date(initialData.tgl_lelang).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    waktu_mulai: initialData?.waktu_mulai?.slice(0, 5) || "08:00",
    waktu_selesai: initialData?.waktu_selesai?.slice(0, 5) || "16:00",
    status:
      initialData?.status || ("pending" as "dibuka" | "ditutup" | "pending" | "dibayar"),
    is_manual: initialData?.is_manual ?? true,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const ids = await getLelangBarangIds();
        setLelangIds(ids);
        
        const result = await getAvailableBarang(1, 7, search, ids);
        setBarangList(result.data);
        setHasMore(result.currentPage < result.totalPages);
        setPage(1);
      } catch (error) {
        console.error("Error fetching initial barang:", error);
        toast.error("Gagal mengambil data barang");
      } finally {
        setIsLoadingBarang(false);
      }
    };

    fetchInitialData();
  }, [search]); // Refetch on search

  useEffect(() => {
    if (page === 1) return; // Already handled by initial fetch

    const fetchMoreBarang = async () => {
      try {
        setIsFetchingMore(true);
        const result = await getAvailableBarang(page, 7, search, lelangIds);
        setBarangList(prev => [...prev, ...result.data]);
        setHasMore(result.currentPage < result.totalPages);
      } catch (error) {
        console.error("Error fetching more barang:", error);
      } finally {
        setIsFetchingMore(false);
      }
    };

    fetchMoreBarang();
  }, [page, lelangIds]);

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
    const formatTimeForDB = (timeStr: string) => {
      // Ensure time is in HH:mm:ss format for database
      if (timeStr.length === 5) return `${timeStr}:00`;
      return timeStr;
    };

    try {
      await onSubmit({
        barang_id: parseInt(formData.id_barang),
        tgl_lelang: formData.tgl_lelang,
        waktu_mulai: formatTimeForDB(formData.waktu_mulai),
        waktu_selesai: formatTimeForDB(formData.waktu_selesai),
        status: formData.status,
        is_manual: formData.is_manual,
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
      <div className="space-y-2">
        <Label htmlFor="id_barang">Barang</Label>
        {isLoadingBarang ? (
          <div className="flex items-center text-sm text-muted-foreground h-10 border rounded-md px-3">
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
                className="w-full justify-between font-normal"
                disabled={isSubmitting}
              >
                {formData.id_barang
                  ? barangList.find(
                      (barang) => barang.id.toString() === formData.id_barang
                    )?.nama || "Pilih barang"
                  : "Pilih barang"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command shouldFilter={false}>
                <div className="relative border-b">
                  <CommandInput 
                    placeholder="Cari barang..." 
                    value={inputValue}
                    onValueChange={setInputValue}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearch(inputValue);
                      }
                    }}
                    className="pr-16 border-none focus:ring-0 w-full"
                  />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 text-xs"
                    onClick={() => setSearch(inputValue)}
                    disabled={isLoadingBarang || isFetchingMore}
                  >
                    {isLoadingBarang ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Cari"
                    )}
                  </Button>
                </div>
                <CommandList>
                  {isLoadingBarang ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      <Loader2 className="mx-auto h-4 w-4 animate-spin mb-2" />
                      Mencari barang...
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {barangList.map((barang) => (
                          <CommandItem
                            key={barang.id}
                            value={barang.id.toString()}
                            onSelect={() => {
                              setFormData({
                                ...formData,
                                id_barang: barang.id.toString(),
                              });
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.id_barang === barang.id.toString()
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{barang.nama}</span>
                              <span className="text-xs text-muted-foreground">
                                Rp {barang.harga_awal.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                        
                        {/* Intersection Trigger */}
                        <div ref={lastElementRef} className="h-1" />
                        
                        {isFetchingMore && (
                          <div className="py-2 flex justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Tanggal Lelang */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tgl_lelang">Tanggal Lelang</Label>
          <Input
            id="tgl_lelang"
            type="date"
            value={formData.tgl_lelang}
            onChange={(e) =>
              setFormData({ ...formData, tgl_lelang: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waktu_mulai">Waktu Mulai</Label>
          <Input
            id="waktu_mulai"
            type="time"
            value={formData.waktu_mulai}
            onChange={(e) =>
              setFormData({ ...formData, waktu_mulai: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waktu_selesai">Waktu Selesai</Label>
          <Input
            id="waktu_selesai"
            type="time"
            value={formData.waktu_selesai}
            onChange={(e) =>
              setFormData({ ...formData, waktu_selesai: e.target.value })
            }
            required
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: "dibuka" | "ditutup" | "pending" | "dibayar") =>
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Tertunda</SelectItem>
            <SelectItem value="dibuka">Dibuka</SelectItem>
            <SelectItem value="ditutup">Ditutup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* is_manual */}
      <div className="space-y-2">
        <Label htmlFor="is_manual">Pengaturan Waktu</Label>
        <Select
          value={formData.is_manual.toString()}
          onValueChange={(value: "true" | "false") =>
            setFormData({ ...formData, is_manual: value === "true" })
          }
        >
          <SelectTrigger id="is_manual">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Manual</SelectItem>
            <SelectItem value="false">Otomatis</SelectItem>
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
