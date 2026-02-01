"use client";

import { useState, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createTopupToken, cancelTopup, getWalletData } from "@/api/payment";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Wallet } from "lucide-react";
import Script from "next/script";
import { Skeleton } from "@/components/ui/skeleton";

// Add global definition for window.snap
declare global {
    interface Window {
        snap: any;
    }
}

export default function DompetPage() {
    const [saldo, setSaldo] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSaldo, setIsLoadingSaldo] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const elementRef = useRef<HTMLDivElement>(null);

    const fetchData = async (pageNum: number = 1, isRefresh: boolean = false) => {
        if (pageNum === 1) setIsLoadingSaldo(true);
        if (pageNum > 1) setIsLoadingMore(true);
        try {
            const data = await getWalletData(pageNum);
            if (data) {
                setSaldo(data.saldo);

                if (data.transactions.length < 7) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                if (isRefresh || pageNum === 1) {
                    setTransactions(data.transactions);
                } else {
                    setTransactions(prev => [...prev, ...data.transactions]);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingSaldo(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchData(page, page === 1);
    }, [page]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                setPage((prev) => prev + 1);
            }
        });

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) observer.unobserve(elementRef.current);
        };
    }, [hasMore, isLoadingSaldo]);

    useEffect(() => {
        // Realtime Subscription
        const supabase = createClient();
        const channel = supabase
            .channel('topup-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'tb_topup'
                },
                (payload: any) => {
                    if (payload.new.status === 'settlement' && payload.old.status !== 'settlement') {
                        toast.success("Pembayaran Berhasil! Saldo telah diperbarui.");
                        setPage(1);
                        fetchData(1, true);
                    } else if (payload.new.status === 'expire' || payload.new.status === 'cancel') {
                        toast.error("Status pembayaran diperbarui: " + payload.new.status);
                        setPage(1);
                        fetchData(1, true);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleTopup = async () => {
        if (!amount || parseInt(amount) < 10000) {
            toast.error("Minimal topup Rp 10.000");
            return;
        }

        setIsLoading(true);
        try {
            const { token, orderId } = await createTopupToken(parseInt(amount));

            if (window.snap) {
                window.snap.pay(token, {
                    onSuccess: function (result: any) {
                        toast.success("Pembayaran berhasil!");
                        setAmount("");
                        // Wait a bit for webhook to process
                        setTimeout(() => { setPage(1); fetchData(1, true); }, 2000);
                    },
                    onPending: function (result: any) {
                        toast.info("Menunggu pembayaran...");
                        setTimeout(() => { setPage(1); fetchData(1, true); }, 1000);
                    },
                    onError: function (result: any) {
                        toast.error("Pembayaran gagal!");
                        setTimeout(() => { setPage(1); fetchData(1, true); }, 1000);
                    },
                    onClose: async function () {
                        // Customer closed the popup without finishing the payment
                        toast.dismiss();
                        toast.warning("Pembayaran dibatalkan");
                        try {
                            await cancelTopup(orderId);
                        } catch (e) {
                            console.error("Failed to cancel topup", e);
                        }

                        setPage(1);
                        fetchData(1, true);
                    }
                });
            } else {
                toast.error("Gagal memuat sistem pembayaran");
            }

        } catch (error) {
            console.error(error);
            toast.error("Gagal memproses topup");
        } finally {
            setIsLoading(false);
            setAmount("");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'settlement': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'failure':
            case 'deny':
            case 'cancel':
            case 'expire': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'settlement': return 'Berhasil';
            case 'pending': return 'Menunggu';
            case 'failure':
            case 'deny':
            case 'cancel':
            case 'expire': return 'Gagal';
            default: return status;
        }
    }

    return (
        <>
            <SiteHeader title="Dompet Saya" />

            {/* Load Midtrans Snap JS */}
            <Script
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="lazyOnload"
            />

            <div className="container p-4 md:p-8 mx-auto relative">
                <div>
                    <h1 className="text-3xl font-bold">Dompet & Saldo</h1>
                    <p className="text-muted-foreground">Kelola saldo untuk mengikuti lelang.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                    <div className="mt-4 space-y-3 sticky top-4">
                        <Card className="bg-primary/5 border-primary/20 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardDescription>Saldo Anda Saat Ini</CardDescription>
                                <CardTitle className="text-4xl font-bold text-primary flex items-center gap-2">
                                    <Wallet className="h-8 w-8" />
                                    {isLoadingSaldo ? (
                                        <Skeleton className="h-8 w-48" />
                                    ) : (
                                        new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                            minimumFractionDigits: 0
                                        }).format(saldo || 0)
                                    )}
                                </CardTitle>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Isi Saldo (Top Up)</CardTitle>
                                <CardDescription>
                                    Masukkan nominal yang ingin Anda tambahkan ke saldo.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid w-full items-center gap-4">
                                    <div className="flex flex-col space-y-1.5">
                                        <Input
                                            id="amount"
                                            placeholder="Contoh: 100000"
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Minimal topup Rp 10.000. Metode pembayaran didukung oleh Midtrans.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button onClick={handleTopup} disabled={isLoading || isLoadingSaldo}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Lanjutkan Pembayaran
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>


                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Transaksi</CardTitle>
                            <CardDescription>
                                Daftar riwayat deposit dan topup saldo Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingSaldo ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 border rounded-lg">
                                        <Skeleton className="w-full h-10" />
                                    </div>
                                    <div className="flex justify-between items-center p-4 border rounded-lg">
                                        <Skeleton className="w-full h-10" />
                                    </div>
                                    <div className="flex justify-between items-center p-4 border rounded-lg">
                                        <Skeleton className="w-full h-10" />
                                    </div>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Belum ada transaksi.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {transactions.map((trx) => (
                                        <div key={trx.id} className="flex justify-between items-center p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium text-lg">
                                                    {new Intl.NumberFormat("id-ID", {
                                                        style: "currency",
                                                        currency: "IDR",
                                                        minimumFractionDigits: 0
                                                    }).format(trx.amount)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(trx.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {trx.status === 'pending' && process.env.NODE_ENV === 'development' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={async () => {
                                                            const toastId = toast.loading("Cek status...");
                                                            try {
                                                                const res = await fetch('/api/payment/check-status', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ order_id: trx.id })
                                                                });
                                                                if (res.ok) {
                                                                    toast.success("Status diperbarui", { id: toastId });
                                                                    setPage(1);
                                                                    fetchData(1, true);
                                                                } else {
                                                                    toast.error("Gagal cek status", { id: toastId });
                                                                }
                                                            } catch (e) {
                                                                toast.error("Error network", { id: toastId });
                                                            }
                                                        }}
                                                    >
                                                        Cek Status
                                                    </Button>
                                                )}
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trx.status)}`}>
                                                    {getStatusLabel(trx.status)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={elementRef} className="h-0 mt-4">
                                    </div>
                                    {isLoadingMore && (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
