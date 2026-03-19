"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPaymentToken, syncPaymentStatus } from "@/api/payment";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
    interface Window {
        snap: any;
    }
}

interface PaymentButtonProps {
    lelangId: number;
    barangId: number;
    amount: number;
}

export function PaymentButton({ lelangId, barangId, amount }: PaymentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const { token, orderId } = await createPaymentToken(lelangId, barangId, amount);

            if (window.snap) {
                window.snap.pay(token, {
                    onSuccess: async function () {
                        toast.success("Pembayaran berhasil diproses!");
                        await syncPaymentStatus(orderId);
                        router.refresh();
                    },
                    onPending: async function () {
                        toast.info("Menunggu pembayaran diselesaikan.");
                        router.refresh();
                    },
                    onError: async function () {
                        toast.error("Pembayaran gagal!");
                        router.refresh();
                    },
                    onClose: async function () {
                        toast.warning("Pembayaran dibatalkan");
                        router.refresh();
                    }
                });
            } else {
                toast.error("Gagal memuat sistem pembayaran. Silakan coba lagi.");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Gagal memproses pembayaran");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Script
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="lazyOnload"
            />
            <Button onClick={handlePayment} className="w-full gap-2 font-semibold" size="lg" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Bayar Sekarang
            </Button>
        </>
    );
}
