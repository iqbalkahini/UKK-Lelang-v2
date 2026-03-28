"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { type EmailOtpType } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function buildErrorUrl(message: string, errorCode?: string | null, errorDescription?: string | null) {
  const params = new URLSearchParams({ error: message });

  if (errorCode) {
    params.set("error_code", errorCode);
  }

  if (errorDescription) {
    params.set("error_description", errorDescription);
  }

  return `/auth/error?${params.toString()}`;
}

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Memverifikasi link autentikasi...");

  useEffect(() => {
    const supabase = createClient();

    const handleAuthConfirmation = async () => {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const hashErrorCode = hashParams.get("error_code");
      const hashErrorDescription = hashParams.get("error_description");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashType = hashParams.get("type") as EmailOtpType | null;

      if (hashErrorCode || hashErrorDescription) {
        router.replace(
          buildErrorUrl(
            hashErrorDescription || "Link autentikasi tidak valid atau sudah kedaluwarsa.",
            hashErrorCode,
            hashErrorDescription,
          ),
        );
        return;
      }

      if (tokenHash && type) {
        setStatus("Mengaktifkan sesi Anda...");
        const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

        router.replace(
          error
            ? buildErrorUrl(error.message)
            : type === "recovery"
              ? "/auth/update-password"
              : "/",
        );
        return;
      }

      if (code) {
        setStatus("Menukar kode login...");
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        router.replace(
          error
            ? buildErrorUrl(error.message)
            : type === "recovery"
              ? "/auth/update-password"
              : "/",
        );
        return;
      }

      if (accessToken && refreshToken) {
        setStatus("Menyiapkan sesi reset password...");
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        router.replace(
          error
            ? buildErrorUrl(error.message)
            : hashType === "recovery"
              ? "/auth/update-password"
              : "/",
        );
        return;
      }

      router.replace(buildErrorUrl("No token hash, code, or session tokens provided"));
    };

    void handleAuthConfirmation();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Memproses Autentikasi</h1>
          <p className="text-sm text-muted-foreground">{status}</p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmContent />
    </Suspense>
  );
}
