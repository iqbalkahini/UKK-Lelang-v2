"use client";

import { LelangTable } from "@/components/lelang-table";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function LelangPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader title="Kelola Lelang" />
            <div className="flex-1 px-4 lg:px-6 py-5">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Daftar Lelang</h1>
                        <p className="text-muted-foreground">
                            Kelola semua lelang yang sedang berjalan atau sudah selesai
                        </p>
                    </div>
                    <Link href="/petugas/lelang/buat">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Lelang
                        </Button>
                    </Link>
                </div>
                <LelangTable />
            </div>
        </div>
    );
}
