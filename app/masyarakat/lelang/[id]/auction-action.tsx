"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { placeBid } from "@/lib/actions/auction";
import { createTopupToken, cancelTopup, syncTopupStatus } from "@/api/payment";
import { Loader2, Gavel } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";

declare global {
    interface Window {
        snap: any;
    }
}

interface AuctionActionProps {
    lelangId: number;
    hargaAwal: number;
    highestBid: number;
    hasDeposited: boolean;
    isOwner?: boolean;
}

export function AuctionAction({ lelangId, hargaAwal, highestBid, hasDeposited }: AuctionActionProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [bidAmount, setBidAmount] = useState<string>("");
    const router = useRouter();

    const minBid = Math.max(highestBid, hargaAwal);
    const depositAmount = Math.ceil(hargaAwal * 0.05);

    useEffect(() => {
        // Realtime Subscription for deposit confirmation
        const supabase = createClient();
        const channel = supabase
            .channel(`auction-deposit-${lelangId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'tb_lelang_deposit',
                    filter: `id_lelang=eq.${lelangId}`
                },
                (payload: any) => {
                    toast.success("Deposit berhasil dikonfirmasi! Anda sekarang bisa menawar.");
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [lelangId]);

    const handleJoin = async () => {
        setIsLoading(true);
        try {
            const { token, orderId } = await createTopupToken(depositAmount, lelangId);

            if (window.snap) {
                window.snap.pay(token, {
                    onSuccess: async function (result: any) {
                        toast.success("Pembayaran berhasil! Mengonfirmasi...");
                        await syncTopupStatus(orderId);
                        router.refresh();
                    },
                    onPending: async function (result: any) {
                        toast.info("Menunggu pembayaran...");
                        await syncTopupStatus(orderId);
                        router.refresh();
                    },
                    onError: async function (result: any) {
                        toast.error("Pembayaran gagal!");
                        await syncTopupStatus(orderId);
                        router.refresh();
                    },
                    onClose: async function () {
                        toast.dismiss();
                        toast.warning("Pembayaran dibatalkan");
                        try {
                            await cancelTopup(orderId);
                        } catch (e) {
                            console.error("Failed to cancel deposit payment", e);
                        }
                        router.refresh();
                    }
                });
            } else {
                toast.error("Gagal memuat sistem pembayaran. Silakan coba lagi.");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Gagal memproses pembayaran jaminan");
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
            const res = await placeBid(lelangId, amount);
            if (res?.error) {
                toast.error(res.error);
                return;
            }
            toast.success("Penawaran berhasil dikirim!");
            setBidAmount("");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Gagal mengirim penawaran");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Script
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="lazyOnload"
            />

            {!hasDeposited ? (
                <div className="p-6 border rounded-lg bg-yellow-50/50 border-yellow-200 space-y-4">
                    <h3 className="font-semibold text-yellow-800">Ikuti Lelang Ini</h3>
                    <p className="text-sm text-yellow-700">
                        Untuk melakukan penawaran, Anda wajib menyetorkan <strong>Uang Jaminan</strong> sebesar 5% dari Harga Awal secara langsung melalui Midtrans.
                    </p>
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span>Uang Jaminan (5%):</span>
                        <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(depositAmount)}</span>
                    </div>
                    <Button onClick={handleJoin} className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Bayar Jaminan & Ikuti Lelang
                    </Button>
                </div>
            ) : (
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
                                type="text"
                                placeholder={`Minimal Rp ${new Intl.NumberFormat("id-ID").format(minBid + 1)}`}
                                value={bidAmount}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    if (val === "") {
                                        setBidAmount("");
                                        return;
                                    }
                                    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(val));
                                    setBidAmount(formatted);
                                }}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kirim Penawaran
                        </Button>
                    </form>
                </div>
            )}
        </>
    );
}
