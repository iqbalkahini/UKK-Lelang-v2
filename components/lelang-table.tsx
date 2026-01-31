"use client";

import { useState, useEffect } from "react";
import {
    getLelang,
    deleteLelang,
    updateStatusLelang,
    getHighestBid,
    type Lelang,
    type GetLelangResponse,
} from "@/api/lelang";
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
    MoreHorizontalIcon,
    Eye,
    PlayCircle,
    StopCircle,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

type LelangTableProps = {
    statusFilter?: "all" | "dibuka" | "ditutup" | "pending";
    showActions?: boolean;
};

export function LelangTable({
    statusFilter = "all",
    showActions = true,
}: LelangTableProps) {
    const [data, setData] = useState<GetLelangResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSearch, setActiveSearch] = useState("");
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const router = useRouter();

    const [filter, setFilter] = useState<{ date: string }>(() => {
        if (typeof window !== "undefined") {
            const dataFilter = localStorage.getItem("filter_lelang");
            if (dataFilter) {
                return JSON.parse(dataFilter);
            }
            const defaultFilter = { date: "descending" };
            localStorage.setItem("filter_lelang", JSON.stringify(defaultFilter));
            return defaultFilter;
        }
        return { date: "descending" };
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getLelang(
                    currentPage,
                    pageSize,
                    activeSearch,
                    statusFilter,
                    filter.date
                );
                console.log(result);
                setData(result);
            } catch (error) {
                console.error("Error fetching lelang:", error);
                toast.error("Gagal mengambil data lelang");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentPage, pageSize, activeSearch, filter.date, refreshTrigger, statusFilter]);

    const handleSearch = () => {
        setActiveSearch(searchQuery);
        setCurrentPage(1);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setActiveSearch("");
        setCurrentPage(1);
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return "-";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleDeleteClick = (id: number) => {
        setDeleteItemId(id);
    };

    const handleDelete = async () => {
        if (!deleteItemId) return;

        try {
            await deleteLelang(deleteItemId);
            toast.success("Lelang berhasil dihapus");
            setRefreshTrigger((prev) => prev + 1);

            if (data && data.data.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            console.error("Error deleting lelang:", error);
            toast.error("Gagal menghapus lelang");
        } finally {
            setDeleteItemId(null);
        }
    };

    const handleToggleStatus = async (lelang: Lelang) => {
        try {
            const newStatus =
                lelang.status === "dibuka"
                    ? "ditutup"
                    : lelang.status === "ditutup"
                        ? "dibuka"
                        : "dibuka";

            // If closing, get highest bid
            let harga_akhir = undefined;
            if (newStatus === "ditutup") {
                harga_akhir = await getHighestBid(lelang.id_lelang);
            }

            await updateStatusLelang(lelang.id_lelang, newStatus, harga_akhir ?? undefined);
            toast.success(
                `Lelang berhasil ${newStatus === "dibuka" ? "dibuka" : "ditutup"}`
            );
            setRefreshTrigger((prev) => prev + 1);
        } catch (error) {
            console.error("Error toggling status:", error);
            toast.error("Gagal mengubah status lelang");
        }
    };

    const handleFilter = () => {
        const newFilter =
            filter.date === "ascending" ? { date: "descending" } : { date: "ascending" };

        setFilter(newFilter);
        localStorage.setItem("filter_lelang", JSON.stringify(newFilter));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "dibuka":
                return <Badge className="bg-green-500 hover:bg-green-600">Dibuka</Badge>;
            case "ditutup":
                return <Badge className="bg-red-500 hover:bg-red-600">Ditutup</Badge>;
            case "pending":
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Search Filter */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama barang..."
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
                    <Button variant="outline" onClick={handleClearSearch} disabled={isLoading}>
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
                            <TableHead
                                className="flex items-center justify-evenly cursor-pointer"
                                onClick={handleFilter}
                            >
                                Tanggal Lelang{" "}
                                {filter.date === "ascending" ? <ArrowBigUp /> : <ArrowBigDown />}
                            </TableHead>
                            <TableHead className="text-right">Harga Awal</TableHead>
                            <TableHead className="text-right">Harga Akhir</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            {showActions && (
                                <TableHead className="text-center w-[150px]">Aksi</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={showActions ? 7 : 6}>
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length ? (
                            data.data.map((lelang) => (
                                <TableRow key={lelang.id_lelang}>
                                    <TableCell className="font-medium">{lelang.id_lelang}</TableCell>
                                    <TableCell>{lelang.barang?.nama || "-"}</TableCell>
                                    <TableCell>{formatDate(lelang.tgl_lelang)}</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(lelang.barang?.harga_awal ?? 0)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(lelang.harga_akhir)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(lelang.status)}
                                    </TableCell>
                                    {showActions && (
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            aria-label="More Options"
                                                        >
                                                            <MoreHorizontalIcon />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem asChild>
                                                                <a href={`/petugas/lelang/${lelang.id_lelang}`}>
                                                                    <Eye /> Detail
                                                                </a>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <a href={`/petugas/lelang/${lelang.id_lelang}/edit`}>
                                                                    <PencilIcon /> Edit
                                                                </a>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleStatus(lelang)}
                                                            >
                                                                {lelang.status === "dibuka" ? (
                                                                    <>
                                                                        <StopCircle /> Tutup Lelang
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <PlayCircle /> Buka Lelang
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(lelang.id_lelang)}
                                                            >
                                                                <TrashIcon /> Hapus
                                                            </DropdownMenuItem>
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={showActions ? 7 : 6} className="h-24 text-center">
                                    {activeSearch
                                        ? "Tidak ada data yang cocok dengan pencarian."
                                        : "Tidak ada data."}
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
                        Menampilkan {(currentPage - 1) * pageSize + 1} hingga{" "}
                        {Math.min(currentPage * pageSize, data.total)} dari {data.total} data
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Baris per halaman</span>
                            <Select
                                value={`${pageSize}`}
                                onValueChange={(value) => {
                                    setPageSize(Number(value));
                                    setCurrentPage(1);
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

                        <div className="flex items-center justify-center text-sm font-medium">
                            Halaman {currentPage} dari {data.totalPages}
                        </div>

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
            <AlertDialog
                open={deleteItemId !== null}
                onOpenChange={(open) => !open && setDeleteItemId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus lelang ini? Tindakan ini tidak dapat
                            dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
