"use client";

import { LelangTable } from "@/components/lelang-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function LelangPage() {
    return (
        <div className="px-4 lg:px-6 py-5">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Kelola Lelang</h1>
                    <p className="text-muted-foreground">
                        Daftar semua lelang yang tersedia
                    </p>
                </div>
                <Link href="/petugas/lelang/create">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Lelang
                    </Button>
                </Link>
            </div>
            <LelangTable />
        </div>
    );
}
