"use client";

import { LelangTable } from "@/components/lelang-table";

export default function TutupLelangPage() {
    return (
        <div className="px-4 lg:px-6 py-5">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Tutup Lelang</h1>
                <p className="text-muted-foreground">
                    Daftar lelang aktif yang dapat ditutup
                </p>
            </div>
            <LelangTable statusFilter="dibuka" />
        </div>
    );
}
