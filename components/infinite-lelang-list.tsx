"use client";

import { useState, useEffect, useRef } from "react";
import { getLelang, Lelang, GetLelangResponse } from "@/api/lelang";
import { LelangCard, LelangCardSkeleton } from "./lelang-card";
import { Loader2, Search, PackageSearch } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

interface InfiniteLelangListProps {
    statusFilter?: string | string[];
}

export function InfiniteLelangList({ statusFilter = "all" }: InfiniteLelangListProps) {
    const [lelangs, setLelangs] = useState<Lelang[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSearch, setActiveSearch] = useState("");
    
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
                        <LelangCard key={lelang.id} lelang={lelang} />
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
        </div>
    );
}
