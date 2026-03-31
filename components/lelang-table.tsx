"use client";

import { useState, useEffect } from "react";
import {
    getLelang,
    deleteLelang,
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { CalendarIcon, ClockIcon } from "lucide-react";

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
        });
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return "-";
        // Check if it matches HH:MM:SS or HH:MM
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
            return timeString.substring(0, 5) + " WIB";
        }
        try {
            return new Date(timeString).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short"
            });
        } catch {
            return timeString;
        }
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
            case "dibayar":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Dibayar</Badge>;
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
            {/* Table View (Desktop) */}
            <div className="hidden md:block overflow-hidden rounded-lg border">
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
                            <TableHead className="text-right">Waktu Mulai / Selesai</TableHead>
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
                                <TableCell colSpan={showActions ? 8 : 7}>
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
                                <TableRow key={lelang.id}>
                                    <TableCell className="font-medium">{lelang.id}</TableCell>
                                    <TableCell>{lelang.barang?.nama || "-"}</TableCell>
                                    <TableCell>{formatDate(lelang.tgl_lelang)}</TableCell>
                                    <TableCell>{formatTime(lelang.waktu_mulai)} - {formatTime(lelang.waktu_selesai)}</TableCell>
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
                                                            <DropdownMenuItem
                                                                onClick={() => router.push(`/petugas/lelang/${lelang.id}`)}
                                                            >
                                                                <Eye /> Detail
                                                            </DropdownMenuItem>
                                                            {lelang.status === "dibayar" ? (
                                                                <>
                                                                    <DropdownMenuItem disabled>
                                                                        Sudah dibayar
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem disabled>
                                                                        <PencilIcon /> Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem disabled>
                                                                        <TrashIcon /> Hapus
                                                                    </DropdownMenuItem>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() => router.push(`/petugas/lelang/${lelang.id}/edit`)}
                                                                    >
                                                                        <PencilIcon /> Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDeleteClick(lelang.id)}
                                                                    >
                                                                        <TrashIcon /> Hapus
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
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
                                <TableCell colSpan={8} className="h-24 text-center">
                                    {activeSearch
                                        ? "Tidak ada data yang cocok dengan pencarian."
                                        : "Tidak ada data."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Card View (Mobile) */}
            <div className="md:hidden flex flex-col gap-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-5 w-3/4" />
                            </CardHeader>
                            <CardContent className="pb-2 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-8 w-full" />
                            </CardFooter>
                        </Card>
                    ))
                ) : data?.data.length ? (
                    data.data.map((lelang) => (
                        <Card key={lelang.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{lelang.barang?.nama || "-"}</CardTitle>
                                        <p className="text-xs text-muted-foreground">ID: #{lelang.id}</p>
                                    </div>
                                    {getStatusBadge(lelang.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4 text-sm space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <CalendarIcon className="h-3.5 w-3.5" />
                                        <span>{formatDate(lelang.tgl_lelang)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <ClockIcon className="h-3.5 w-3.5" />
                                        <span>{formatTime(lelang.waktu_mulai)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Harga Awal</p>
                                        <p className="font-semibold">{formatCurrency(lelang.barang?.harga_awal ?? 0)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Harga Akhir</p>
                                        <p className="font-semibold text-primary">{formatCurrency(lelang.harga_akhir)}</p>
                                    </div>
                                </div>
                            </CardContent>
                            {showActions && (
                                <CardFooter className="pt-0 border-t flex gap-2 p-2">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 h-9" 
                                        onClick={() => router.push(`/petugas/lelang/${lelang.id}`)}
                                    >
                                        <Eye className="mr-2 h-4 w-4" /> Detail
                                    </Button>
                                    {lelang.status !== "dibayar" && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon" className="h-9 w-9">
                                                    <MoreHorizontalIcon className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/petugas/lelang/${lelang.id}/edit`)}>
                                                    <PencilIcon className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(lelang.id)}>
                                                    <TrashIcon className="mr-2 h-4 w-4" /> Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </CardFooter>
                            )}
                        </Card>
                    ))
                ) : (
                    <div className="py-12 text-center border rounded-lg bg-muted/20">
                        <p className="text-muted-foreground">
                            {activeSearch ? "Tidak ada data yang cocok." : "Tidak ada data lelang."}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {data && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 pb-4">
                    <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
                        Menampilkan {(currentPage - 1) * pageSize + 1} hingga{" "}
                        {Math.min(currentPage * pageSize, data.total)} dari {data.total} data
                    </div>
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium whitespace-nowrap">Baris per halaman</span>
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

                        <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
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
