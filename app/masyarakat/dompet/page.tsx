"use client";

import { useState, useEffect } from "react";
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
import { createTopupToken } from "@/api/payment";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Wallet } from "lucide-react";
import Script from "next/script";

// Add global definition for window.snap
declare global {
    interface Window {
        snap: any;
    }
}

export default function DompetPage() {
    const [saldo, setSaldo] = useState<number | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSaldo, setIsLoadingSaldo] = useState(true);

    const fetchSaldo = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('tb_masyarakat')
                .select('saldo')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setSaldo(data.saldo);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingSaldo(false);
        }
    };

    useEffect(() => {
        fetchSaldo();
    }, []);

    const handleTopup = async () => {
        if (!amount || parseInt(amount) < 10000) {
            toast.error("Minimal topup Rp 10.000");
            return;
        }

        setIsLoading(true);
        try {
            const token = await createTopupToken(parseInt(amount));

            if (window.snap) {
                window.snap.pay(token, {
                    onSuccess: function (result: any) {
                        toast.success("Pembayaran berhasil!");
                        setAmount("");
                        // Wait a bit for webhook to process
                        setTimeout(fetchSaldo, 2000);
                    },
                    onPending: function (result: any) {
                        toast.info("Menunggu pembayaran...");
                    },
                    onError: function (result: any) {
                        toast.error("Pembayaran gagal!");
                    },
                    onClose: function () {
                        // Customer closed the popup without finishing the payment
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
        }
    };

    return (
        <>
            <SiteHeader title="Dompet Saya" />

            {/* Load Midtrans Snap JS */}
            <Script
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="lazyOnload"
            />

            <div className="container p-4 md:p-8 max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Dompet & Saldo</h1>
                    <p className="text-muted-foreground">Kelola saldo untuk mengikuti lelang.</p>
                </div>

                <Card className="bg-primary/5 border-primary/20 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription>Saldo Anda Saat Ini</CardDescription>
                        <CardTitle className="text-4xl font-bold text-primary flex items-center gap-2">
                            <Wallet className="h-8 w-8" />
                            {isLoadingSaldo ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
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
        </>
    );
}
