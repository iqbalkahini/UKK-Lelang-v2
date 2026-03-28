import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function buildErrorUrl(request: NextRequest, message: string, errorCode?: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/auth/error";
  url.searchParams.set("error", message);

  if (errorCode) {
    url.searchParams.set("error_code", errorCode);
  }

  return url;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      buildErrorUrl(request, "Link autentikasi tidak valid atau tidak lengkap."),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(
      buildErrorUrl(request, error.message, error.code),
    );
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname =
    type === "recovery"
      ? "/auth/update-password"
      : next && next.startsWith("/")
        ? next
        : "/";
  redirectUrl.search = "";

  return NextResponse.redirect(redirectUrl);
}
