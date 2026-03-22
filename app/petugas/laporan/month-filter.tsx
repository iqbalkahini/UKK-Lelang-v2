"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const BULAN = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
];

const currentYear = new Date().getFullYear();
const TAHUN = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

interface MonthFilterProps {
    bulan: string;
    tahun: string;
}

export function MonthFilter({ bulan, tahun }: MonthFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateFilter = (key: "bulan" | "tahun", value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <Label className="text-sm font-medium shrink-0">Bulan:</Label>
                <Select value={bulan} onValueChange={(v) => updateFilter("bulan", v)}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {BULAN.map((b) => (
                            <SelectItem key={b.value} value={b.value}>
                                {b.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <Label className="text-sm font-medium shrink-0">Tahun:</Label>
                <Select value={tahun} onValueChange={(v) => updateFilter("tahun", v)}>
                    <SelectTrigger className="w-28">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {TAHUN.map((t) => (
                            <SelectItem key={t} value={t}>
                                {t}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
