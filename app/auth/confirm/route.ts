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
  const code = searchParams.get("code");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const supabase = await createClient();
  let error: { message: string; code?: string } | null = null;

  if (tokenHash && type) {
    const result = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    error = result.error;
  } else if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } else {
    return NextResponse.redirect(
      buildErrorUrl(request, "Link autentikasi tidak valid atau tidak lengkap."),
    );
  }

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
