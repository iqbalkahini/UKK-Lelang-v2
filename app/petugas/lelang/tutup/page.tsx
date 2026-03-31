"use client";

import { InfiniteLelangList } from "@/components/infinite-lelang-list";
import { SiteHeader } from "@/components/site-header";

export default function TutupLelangPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader title="Tutup Lelang" />
            <div className="flex-1 px-4 lg:px-6 py-5">
                <div className="mb-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Tutup Lelang
                        </h1>
                        <p className="text-muted-foreground">
                            Daftar lelang aktif yang dapat segera ditutup dan diselesaikan
                        </p>
                    </div>
                </div>
            
                <InfiniteLelangList statusFilter="dibuka" actionType="tutup" />
            </div>
        </div>
    );
}
