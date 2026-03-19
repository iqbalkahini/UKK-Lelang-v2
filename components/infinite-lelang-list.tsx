"use client";

import { useState, useEffect, useRef } from "react";
import { getLelang, Lelang, GetLelangResponse } from "@/api/lelang";
import { LelangCard, LelangCardSkeleton } from "./lelang-card";
import { Loader2, Search, PackageSearch } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter, 
    DialogDescription 
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { updateLelang } from "@/api/lelang";
import { closeAuction } from "@/lib/actions/auction";

interface InfiniteLelangListProps {
    statusFilter?: string | string[];
    actionType?: "buka" | "tutup";
}

export function InfiniteLelangList({ statusFilter = "all", actionType = "buka" }: InfiniteLelangListProps) {
    const [lelangs, setLelangs] = useState<Lelang[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSearch, setActiveSearch] = useState("");
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLelang, setSelectedLelang] = useState<Lelang | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [timeSetting, setTimeSetting] = useState({
        is_manual: true,
        tgl_lelang: new Date().toISOString().slice(0, 10),
        waktu_mulai: "08:00",
        waktu_selesai: "16:00"
    });

    const limit = 8;
    const observerTarget = useRef<HTMLDivElement>(null);

    const fetchData = async (pageNum: number, search: string, isInitial: boolean = false) => {
        if (isInitial) setIsLoading(true);
        else setIsLoadingMore(true);

        try {
            const response = await getLelang(pageNum, limit, search, statusFilter);
            
            if (isInitial) {
                setLelangs(response.data);
            } else {
                setLelangs(prev => [...prev, ...response.data]);
            }

            setHasMore(pageNum < response.totalPages);
        } catch (error) {
            console.error("Error fetching lelang:", error);
            toast.error("Gagal mengambil data lelang");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchData(1, activeSearch, true);
    }, [activeSearch, statusFilter]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchData(nextPage, activeSearch, false);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isLoading, isLoadingMore, page, activeSearch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveSearch(searchQuery);
    };

    const handleOpenModal = (lelang: Lelang) => {
        setSelectedLelang(lelang);
        setTimeSetting({
            is_manual: lelang.is_manual ?? true,
            tgl_lelang: lelang.tgl_lelang ? new Date(lelang.tgl_lelang).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            waktu_mulai: lelang.waktu_mulai?.slice(0, 5) || "08:00",
            waktu_selesai: lelang.waktu_selesai?.slice(0, 5) || "16:00"
        });
        setIsModalOpen(true);
    };

    const handleOpenLelang = async () => {
        if (!selectedLelang) return;

        setIsSubmitting(true);
        try {
            if (actionType === "tutup") {
                const res = await closeAuction(selectedLelang.id);
                if (res.error) throw new Error(res.error);
                toast.success("Lelang berhasil ditutup");
            } else {
                const formatTimeForDB = (timeStr: string) => {
                    if (timeStr.length === 5) return `${timeStr}:00`;
                    return timeStr;
                };

                await updateLelang(selectedLelang.id, {
                    status: "dibuka",
                    is_manual: true,
                    tgl_lelang: timeSetting.tgl_lelang,
                    waktu_mulai: formatTimeForDB(timeSetting.waktu_mulai),
                    waktu_selesai: formatTimeForDB(timeSetting.waktu_selesai)
                });
                toast.success("Lelang berhasil dibuka");
            }

            setIsModalOpen(false);
            // Refresh data
            setPage(1);
            fetchData(1, activeSearch, true);
        } catch (error) {
            console.error(`Error ${actionType === "tutup" ? "closing" : "opening"} lelang:`, error);
            toast.error(`Gagal ${actionType === "tutup" ? "menutup" : "membuka"} lelang`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari nama barang..." 
                        className="pl-9 bg-background/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button type="submit" disabled={isLoading}>Cari</Button>
            </form>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <LelangCardSkeleton key={i} />
                    ))}
                </div>
            ) : lelangs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {lelangs.map((lelang) => (
                        <LelangCard 
                            key={lelang.id} 
                            lelang={lelang} 
                            onOpen={() => handleOpenModal(lelang)} 
                            actionText={actionType === "tutup" ? "Tutup Lelang Sekarang" : "Buka Lelang Sekarang"}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="bg-muted p-6 rounded-full">
                        <PackageSearch className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Tidak Ada Lelang</h3>
                        <p className="text-muted-foreground">
                            {activeSearch 
                                ? `Pencarian "${activeSearch}" tidak ditemukan.` 
                                : "Belum ada lelang yang tersedia untuk dibuka."}
                        </p>
                    </div>
                    {activeSearch && (
                        <Button variant="outline" onClick={() => { setSearchQuery(""); setActiveSearch(""); }}>
                            Tampilkan Semua
                        </Button>
                    )}
                </div>
            )}

            <div ref={observerTarget} className="h-10 flex items-center justify-center">
                {isLoadingMore && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
            </div>

            {/* Action Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{actionType === "tutup" ? "Tutup Lelang" : "Buka Lelang"}</DialogTitle>
                        <DialogDescription>
                            {actionType === "tutup" ? (
                                <>Apakah Anda yakin ingin menutup lelang untuk barang <strong>{selectedLelang?.barang?.nama}</strong>? Lemenang lelang akan ditentukan dari penawaran tertinggi.</>
                            ) : (
                                <>Konfirmasi pengaturan waktu untuk barang <strong>{selectedLelang?.barang?.nama}</strong>.</>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {actionType === "buka" && (
                        <div className="grid gap-4 py-4">
                            {timeSetting.is_manual && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="tgl_lelang">Tanggal Lelang</Label>
                                        <Input 
                                            id="tgl_lelang" 
                                            type="date" 
                                            value={timeSetting.tgl_lelang}
                                            onChange={(e) => setTimeSetting(prev => ({ ...prev, tgl_lelang: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="waktu_mulai">Waktu Mulai</Label>
                                            <Input 
                                                id="waktu_mulai" 
                                                type="time" 
                                                value={timeSetting.waktu_mulai}
                                                onChange={(e) => setTimeSetting(prev => ({ ...prev, waktu_mulai: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="waktu_selesai">Waktu Selesai</Label>
                                            <Input 
                                                id="waktu_selesai" 
                                                type="time" 
                                                value={timeSetting.waktu_selesai}
                                                onChange={(e) => setTimeSetting(prev => ({ ...prev, waktu_selesai: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                            Batal
                        </Button>
                        <Button 
                            onClick={handleOpenLelang} 
                            disabled={isSubmitting}
                            variant={actionType === "tutup" ? "destructive" : "default"}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {actionType === "tutup" ? "Menutup..." : "Membuka..."}
                                </>
                            ) : (
                                actionType === "tutup" ? "Tutup Lelang" : "Buka Lelang"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
