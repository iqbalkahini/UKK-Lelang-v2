"use client";

import { useState, useEffect, useCallback } from "react";
import { getBarang, type Barang, type GetBarangResponse } from "@/api/barang";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    SearchIcon,
    PencilIcon,
    TrashIcon,
    ArrowBigUp,
    ArrowBigDown,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "./ui/skeleton";

export function BarangTable() {
    const [data, setData] = useState<GetBarangResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSearch, setActiveSearch] = useState(""); // The search term being used in API
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger for manual refresh
    const router = useRouter();

    // Initialize filter from localStorage
    const [filter, setFilter] = useState<{ date: string }>(() => {
        // Only runs once on mount
        if (typeof window !== 'undefined') {
            const dataFilter = localStorage.getItem('filter_tabel');
            if (dataFilter) {
                return JSON.parse(dataFilter);
            }
            // Set default filter to localStorage
            const defaultFilter = { date: 'ascending' };
            localStorage.setItem('filter_tabel', JSON.stringify(defaultFilter));
            return defaultFilter;
        }
        return { date: 'ascending' };
    });

    // Fetch data with direct dependencies - no useCallback needed
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getBarang(currentPage, pageSize, activeSearch, filter.date);
                setData(result);
            } catch (error) {
                console.error("Error fetching barang:", error);
                toast.error("Gagal mengambil data barang");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentPage, pageSize, activeSearch, filter.date, refreshTrigger])

    // Handle search button click
    const handleSearch = () => {
        setActiveSearch(searchQuery);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Handle search input enter key
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchQuery("");
        setActiveSearch("");
        setCurrentPage(1);
    };

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

    // Handle edit
    const handleEdit = (barang: Barang) => {
        toast.info(`Edit barang: ${barang.nama}`);
        // TODO: Implement edit functionality
        console.log("Edit barang:", barang);
    };

    // Handle delete confirmation
    const handleDeleteClick = (id: number) => {
        setDeleteItemId(id);
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deleteItemId) return;

        try {
            // TODO: Implement delete API call
            toast.success("Barang berhasil dihapus");

            // Trigger re-fetch by incrementing refresh counter
            setRefreshTrigger(prev => prev + 1);

            // Reset to page 1 if only one item left on current page
            if (data && data.data.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            console.error("Error deleting barang:", error);
            toast.error("Gagal menghapus barang");
        } finally {
            setDeleteItemId(null);
        }
    };

    const handleFilter = () => {
        const newFilter = filter.date === 'ascending'
            ? { date: 'descending' }
            : { date: 'ascending' };

        setFilter(newFilter);
        // Persist to localStorage
        localStorage.setItem('filter_tabel', JSON.stringify(newFilter));
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Search Filter */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama atau deskripsi barang..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="pl-9"
                    />
                </div>
                <Button onClick={handleSearch} disabled={isLoading}>
                    Cari
                </Button>
                {activeSearch && (
                    <Button
                        variant="outline"
                        onClick={handleClearSearch}
                        disabled={isLoading}
                    >
                        Reset
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Nama Barang</TableHead>
                            <TableHead className="flex items-center justify-evenly cursor-pointer" onClick={handleFilter}>Tanggal  {filter.date == 'ascending' ? <ArrowBigUp /> : <ArrowBigDown />}</TableHead>
                            <TableHead className="text-right">Harga Awal</TableHead>
                            <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
                            <TableHead className="text-center w-[150px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell>
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length ? (
                            data.data.map((barang) => (
                                <TableRow key={barang.id}>
                                    <TableCell className="font-medium">{barang.id}</TableCell>
                                    <TableCell>{barang.nama}</TableCell>
                                    <TableCell>{formatDate(barang.tanggal)}</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(barang.harga_awal)}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell max-w-md truncate">
                                        {barang.deskripsi_barang}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/petugas/barang/${barang.id}`)}
                                                className="h-8"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                                <span className="hidden sm:inline ml-1">Detail</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(barang)}
                                                className="h-8"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                                <span className="hidden sm:inline ml-1">Edit</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteClick(barang.id)}
                                                className="h-8 text-destructive hover:text-destructive"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                                <span className="hidden sm:inline ml-1">Hapus</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    {activeSearch ? "Tidak ada data yang cocok dengan pencarian." : "Tidak ada data."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {data && (
                <div className="flex items-center justify-between px-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Menampilkan {((currentPage - 1) * pageSize) + 1} hingga{" "}
                        {Math.min(currentPage * pageSize, data.total)} dari {data.total}{" "}
                        data
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Page size selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Baris per halaman</span>
                            <Select
                                value={`${pageSize}`}
                                onValueChange={(value) => {
                                    setPageSize(Number(value));
                                    setCurrentPage(1); // Reset to first page when changing page size
                                }}
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue placeholder={pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[5, 10, 20, 30, 50].map((size) => (
                                        <SelectItem key={size} value={`${size}`}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Page info */}
                        <div className="flex items-center justify-center text-sm font-medium">
                            Halaman {currentPage} dari {data.totalPages}
                        </div>

                        {/* Pagination buttons */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                size="icon"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                <span className="sr-only">Halaman pertama</span>
                                <ChevronsLeftIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                size="icon"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <span className="sr-only">Halaman sebelumnya</span>
                                <ChevronLeftIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                size="icon"
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(data.totalPages, prev + 1))
                                }
                                disabled={currentPage === data.totalPages}
                            >
                                <span className="sr-only">Halaman berikutnya</span>
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                size="icon"
                                onClick={() => setCurrentPage(data.totalPages)}
                                disabled={currentPage === data.totalPages}
                            >
                                <span className="sr-only">Halaman terakhir</span>
                                <ChevronsRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteItemId !== null} onOpenChange={(open) => !open && setDeleteItemId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
