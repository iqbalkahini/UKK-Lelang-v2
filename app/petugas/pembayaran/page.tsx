import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ValidateButton } from "./validate-button";
import { CheckCircle2, Clock, Receipt, TrendingUp, Users } from "lucide-react";

export default async function PembayaranPage() {
    const supabase = await createClient();

    const { data: payments } = await supabase
        .from("tb_pembayaran")
        .select(`
            id,
            tgl_pembayaran,
            jumlah_pembayaran,
            status,
            barang:barang_id(nama),
            masyarakat:user_id(nama_lengkap, username)
        `)
        .order("tgl_pembayaran", { ascending: false });

    const formatCurrency = (amount: number | null) => {
        if (!amount) return "-";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(new Date(dateStr));
    };

    const totalPembayaran = payments?.length ?? 0;
    const sudahDibayar = payments?.filter((p) => p.status === "Sudah Dibayar").length ?? 0;
    const belumDibayar = payments?.filter((p) => p.status === "Belum Dibayar").length ?? 0;
    const totalNominal = payments
        ?.filter((p) => p.status === "Sudah Dibayar")
        .reduce((acc, p) => acc + (p.jumlah_pembayaran ?? 0), 0) ?? 0;

    return (
        <>
            <SiteHeader title="Validasi Pembayaran" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Validasi Pembayaran</h1>
                    <p className="text-muted-foreground mt-1">
                        Verifikasi dan validasi pembayaran dari pemenang lelang.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                                <Receipt className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Total</p>
                                <p className="text-2xl font-bold">{totalPembayaran}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-full p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Menunggu</p>
                                <p className="text-2xl font-bold">{belumDibayar}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-full p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Tervalidasi</p>
                                <p className="text-2xl font-bold">{sudahDibayar}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Total Diterima</p>
                                <p className="text-lg font-bold leading-tight">{formatCurrency(totalNominal)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {!payments || payments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="rounded-full bg-muted p-5 mb-4">
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold text-lg">Belum ada pembayaran</h3>
                                <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                                    Data pembayaran dari pemenang lelang akan muncul di sini.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-10 pl-4">#</TableHead>
                                        <TableHead>Nama Barang</TableHead>
                                        <TableHead>Pemenang</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead className="text-right">Jumlah Pembayaran</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="w-44 text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment, index) => {
                                        const barang = Array.isArray(payment.barang)
                                            ? payment.barang[0]
                                            : payment.barang;
                                        const masyarakat = Array.isArray(payment.masyarakat)
                                            ? payment.masyarakat[0]
                                            : payment.masyarakat;
                                        const isSudahDibayar = payment.status === "Sudah Dibayar";

                                        return (
                                            <TableRow key={payment.id} className="hover:bg-muted/30">
                                                <TableCell className="pl-4 text-muted-foreground text-sm">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {barang?.nama ?? "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {masyarakat?.nama_lengkap ?? "-"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            @{masyarakat?.username ?? "-"}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(payment.tgl_pembayaran)}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {formatCurrency(payment.jumlah_pembayaran)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={isSudahDibayar ? "default" : "secondary"}
                                                        className={
                                                            isSudahDibayar
                                                                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                                                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-0"
                                                        }
                                                    >
                                                        {isSudahDibayar ? (
                                                            <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                                                        ) : (
                                                            <Clock className="h-3 w-3 mr-1 inline" />
                                                        )}
                                                        {payment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {isSudahDibayar ? (
                                                        <span className="text-xs text-muted-foreground italic">
                                                            Sudah divalidasi
                                                        </span>
                                                    ) : (
                                                        <ValidateButton
                                                            pembayaranId={payment.id}
                                                            namaPembayar={masyarakat?.nama_lengkap ?? "Pemenang"}
                                                        />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
