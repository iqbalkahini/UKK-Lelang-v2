"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { joinAuction, placeBid } from "@/lib/actions/auction";
import { Loader2, Gavel } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuctionActionProps {
    lelangId: number;
    hargaAwal: number;
    highestBid: number;
    hasDeposited: boolean;
    isOwner?: boolean; // If we want to prevent owner from bidding
}

export function AuctionAction({ lelangId, hargaAwal, highestBid, hasDeposited }: AuctionActionProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [bidAmount, setBidAmount] = useState<string>("");
    const router = useRouter();

    const minBid = Math.max(highestBid, hargaAwal);
    // Suggest next bid: +10% or +10k? Let's just say +1 more than current.

    const handleJoin = async () => {
        if (!confirm(`Apakah Anda yakin ingin membayar jaminan sebesar ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(hargaAwal)}? Saldo akan dipotong langsung.`)) {
            return;
        }

        setIsLoading(true);
        try {
            await joinAuction(lelangId, hargaAwal);
            toast.success("Berhasil membayar jaminan! Silakan tawar barang ini.");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Gagal join lelang");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBid = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(bidAmount.replace(/\D/g, ''));

        if (amount <= minBid) {
            toast.error("Tawaran harus lebih tinggi dari harga saat ini");
            return;
        }

        setIsLoading(true);
        try {
            await placeBid(lelangId, amount);
            toast.success("Penawaran berhasil dikirim!");
            setBidAmount("");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Gagal mengirim penawaran");
        } finally {
            setIsLoading(false);
        }
    }

    if (!hasDeposited) {
        return (
            <div className="p-6 border rounded-lg bg-yellow-50/50 border-yellow-200 space-y-4">
                <h3 className="font-semibold text-yellow-800">Ikuti Lelang Ini</h3>
                <p className="text-sm text-yellow-700">
                    Untuk melakukan penawaran, Anda wajib menyetorkan <strong>Uang Jaminan</strong> sebesar Harga Awal.
                </p>
                <div className="flex justify-between items-center text-sm font-medium">
                    <span>Uang Jaminan:</span>
                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(hargaAwal)}</span>
                </div>
                <Button onClick={handleJoin} className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Bayar Jaminan & Ikuti Lelang
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 border rounded-lg space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Masukkan Penawaran
            </h3>
            <p className="text-sm text-muted-foreground">
                Tawaran tertinggi saat ini: <strong>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(highestBid === 0 ? hargaAwal : highestBid)}</strong>
            </p>

            <form onSubmit={handleBid} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nominal Tawaran (Rp)</label>
                    <Input
                        type="number"
                        placeholder={`Minimal ${minBid + 1}`}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Kirim Penawaran
                </Button>
            </form>
        </div>
    );
}
