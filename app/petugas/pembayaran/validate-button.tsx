"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { validatePayment } from "@/api/payment/validate";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ValidateButtonProps {
    pembayaranId: number;
    namaPembayar: string;
}

export function ValidateButton({ pembayaranId, namaPembayar }: ValidateButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleValidate() {
        setLoading(true);
        try {
            await validatePayment(pembayaranId);
            toast.success("Pembayaran berhasil divalidasi!");
        } catch (err: any) {
            toast.error(err.message || "Gagal memvalidasi pembayaran.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="sm" className="w-full gap-2" disabled={loading}>
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle className="h-4 w-4" />
                    )}
                    Validasi Pembayaran
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Validasi</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin memvalidasi pembayaran dari{" "}
                        <span className="font-semibold text-foreground">{namaPembayar}</span>?
                        Status pembayaran akan diubah menjadi <span className="font-semibold text-emerald-600">Sudah Dibayar</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleValidate} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Ya, Validasi
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
