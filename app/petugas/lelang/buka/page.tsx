"use client";

import { useState } from "react";
import { InfiniteLelangList } from "@/components/infinite-lelang-list";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BukaLelangPage() {
    const [status, setStatus] = useState<string>("all");

    // Mapping for status values
    const getStatusFilter = (val: string) => {
        if (val === "all") return ["pending", "ditutup"];
        return val;
    };

    return (
        <div className="px-4 lg:px-8 py-8 max-w-7xl mx-auto">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Buka Lelang
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl font-medium tracking-tight">
                        Kelola daftar lelang yang sedang ditangguhkan atau telah ditutup.
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
    );
}
