"use client";

import { useState } from "react";
import { InfiniteLelangList } from "@/components/infinite-lelang-list";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/site-header";

export default function BukaLelangPage() {
    const [status, setStatus] = useState<string>("all");

    // Mapping for status values
    const getStatusFilter = (val: string) => {
        if (val === "all") return ["pending", "ditutup"];
        return val;
    };

    return (
        <div className="flex flex-col min-h-screen">
            <SiteHeader title="Buka Lelang" />
            <div className="flex-1 px-4 lg:px-6 py-5">
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Buka Lelang</h1>
                        <p className="text-muted-foreground">
                            Kelola daftar lelang yang sedang ditangguhkan atau telah ditutup
                        </p>
                    </div>

                <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setStatus}>
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                        <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Semua</TabsTrigger>
                        <TabsTrigger value="pending" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Tertunda</TabsTrigger>
                        <TabsTrigger value="ditutup" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Ditutup</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            
                <InfiniteLelangList statusFilter={getStatusFilter(status)} />
            </div>
        </div>
    );
}
