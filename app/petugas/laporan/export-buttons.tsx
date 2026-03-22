"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PembayaranRow {
    no: number;
    namaBarang: string;
    pemenang: string;
    username: string;
    tanggal: string;
    hargaAkhir: number;
    jumlahDibayar: number;
    status: string;
}

export interface LelangRow {
    no: number;
    namaBarang: string;
    tanggalLelang: string;
    waktu: string;
    hargaAwal: number;
    hargaAkhir: number;
    pemenang: string;
    status: string;
}

export interface BarangRow {
    no: number;
    namaBarang: string;
    tanggalDaftar: string;
    tanggalLelang: string;
    hargaAwal: number;
    hargaAkhir: number;
    statusLelang: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatRp = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

// ─── Export Pembayaran ─────────────────────────────────────────────────────────

interface ExportPembayaranProps {
    data: PembayaranRow[];
    bulan: string;
    tahun: string;
    namaBulan: string;
}

export function ExportPembayaranButton({ data, bulan, tahun, namaBulan }: ExportPembayaranProps) {
    const [loading, setLoading] = useState<"excel" | "pdf" | null>(null);

    const title = `Laporan Pembayaran - ${namaBulan} ${tahun}`;

    const handleExcel = async () => {
        setLoading("excel");
        const { utils, writeFile } = await import("xlsx");
        const wsData = [
            [title],
            [],
            ["No", "Nama Barang", "Pemenang", "Username", "Tanggal Bayar", "Harga Akhir", "Jumlah Dibayar", "Status"],
            ...data.map(r => [r.no, r.namaBarang, r.pemenang, r.username, r.tanggal, r.hargaAkhir, r.jumlahDibayar, r.status]),
        ];
        const ws = utils.aoa_to_sheet(wsData);
        ws["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 25 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }];
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Laporan Pembayaran");
        writeFile(wb, `laporan-pembayaran-${bulan}-${tahun}.xlsx`);
        setLoading(null);
    };

    const handlePdf = async () => {
        setLoading("pdf");
        const { default: jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(14);
        doc.text(title, 14, 15);
        autoTable(doc, {
            startY: 22,
            head: [["No", "Nama Barang", "Pemenang", "Tanggal", "Harga Akhir", "Dibayar", "Status"]],
            body: data.map(r => [r.no, r.namaBarang, r.pemenang, r.tanggal, formatRp(r.hargaAkhir), formatRp(r.jumlahDibayar), r.status]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [30, 130, 80] },
        });
        doc.save(`laporan-pembayaran-${bulan}-${tahun}.pdf`);
        setLoading(null);
    };

    return <ExportDropdown loading={loading} onExcel={handleExcel} onPdf={handlePdf} />;
}

// ─── Export Lelang ─────────────────────────────────────────────────────────────

interface ExportLelangProps {
    data: LelangRow[];
    bulan: string;
    tahun: string;
    namaBulan: string;
}

export function ExportLelangButton({ data, bulan, tahun, namaBulan }: ExportLelangProps) {
    const [loading, setLoading] = useState<"excel" | "pdf" | null>(null);
    const title = `Laporan Lelang - ${namaBulan} ${tahun}`;

    const handleExcel = async () => {
        setLoading("excel");
        const { utils, writeFile } = await import("xlsx");
        const wsData = [
            [title],
            [],
            ["No", "Nama Barang", "Tanggal Lelang", "Waktu", "Harga Awal", "Harga Akhir", "Pemenang", "Status"],
            ...data.map(r => [r.no, r.namaBarang, r.tanggalLelang, r.waktu, r.hargaAwal, r.hargaAkhir, r.pemenang, r.status]),
        ];
        const ws = utils.aoa_to_sheet(wsData);
        ws["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 22 }, { wch: 12 }];
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Laporan Lelang");
        writeFile(wb, `laporan-lelang-${bulan}-${tahun}.xlsx`);
        setLoading(null);
    };

    const handlePdf = async () => {
        setLoading("pdf");
        const { default: jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(14);
        doc.text(title, 14, 15);
        autoTable(doc, {
            startY: 22,
            head: [["No", "Nama Barang", "Tanggal", "Waktu", "Harga Awal", "Harga Akhir", "Pemenang", "Status"]],
            body: data.map(r => [r.no, r.namaBarang, r.tanggalLelang, r.waktu, formatRp(r.hargaAwal), formatRp(r.hargaAkhir), r.pemenang, r.status]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [37, 99, 235] },
        });
        doc.save(`laporan-lelang-${bulan}-${tahun}.pdf`);
        setLoading(null);
    };

    return <ExportDropdown loading={loading} onExcel={handleExcel} onPdf={handlePdf} />;
}

// ─── Export Barang ─────────────────────────────────────────────────────────────

interface ExportBarangProps {
    data: BarangRow[];
    bulan: string;
    tahun: string;
    namaBulan: string;
}

export function ExportBarangButton({ data, bulan, tahun, namaBulan }: ExportBarangProps) {
    const [loading, setLoading] = useState<"excel" | "pdf" | null>(null);
    const title = `Laporan Barang - ${namaBulan} ${tahun}`;

    const handleExcel = async () => {
        setLoading("excel");
        const { utils, writeFile } = await import("xlsx");
        const wsData = [
            [title],
            [],
            ["No", "Nama Barang", "Tgl Daftar", "Tgl Lelang", "Harga Awal", "Harga Akhir", "Status Lelang"],
            ...data.map(r => [r.no, r.namaBarang, r.tanggalDaftar, r.tanggalLelang, r.hargaAwal, r.hargaAkhir, r.statusLelang]),
        ];
        const ws = utils.aoa_to_sheet(wsData);
        ws["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 14 }];
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Laporan Barang");
        writeFile(wb, `laporan-barang-${bulan}-${tahun}.xlsx`);
        setLoading(null);
    };

    const handlePdf = async () => {
        setLoading("pdf");
        const { default: jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(14);
        doc.text(title, 14, 15);
        autoTable(doc, {
            startY: 22,
            head: [["No", "Nama Barang", "Tgl Daftar", "Tgl Lelang", "Harga Awal", "Harga Akhir", "Status"]],
            body: data.map(r => [r.no, r.namaBarang, r.tanggalDaftar, r.tanggalLelang, formatRp(r.hargaAwal), formatRp(r.hargaAkhir), r.statusLelang]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [124, 58, 237] },
        });
        doc.save(`laporan-barang-${bulan}-${tahun}.pdf`);
        setLoading(null);
    };

    return <ExportDropdown loading={loading} onExcel={handleExcel} onPdf={handlePdf} />;
}

// ─── Shared Dropdown UI ───────────────────────────────────────────────────────

function ExportDropdown({
    loading,
    onExcel,
    onPdf,
}: {
    loading: "excel" | "pdf" | null;
    onExcel: () => void;
    onPdf: () => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={loading !== null}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExcel} className="gap-2 cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    Export Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPdf} className="gap-2 cursor-pointer">
                    <FileText className="h-4 w-4 text-red-500" />
                    Export PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
