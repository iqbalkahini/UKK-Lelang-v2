"use client";

import { InfiniteLelangList } from "@/components/infinite-lelang-list";

export default function TutupLelangPage() {
    return (
        <div className="px-4 lg:px-8 py-8 w-full">
            <div className="mb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Tutup Lelang
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl font-medium tracking-tight">
                        Daftar lelang aktif yang dapat segera ditutup dan diselesaikan.
                    </p>
                </div>
            </div>
            
            <InfiniteLelangList statusFilter="dibuka" />
        </div>
    );
}
