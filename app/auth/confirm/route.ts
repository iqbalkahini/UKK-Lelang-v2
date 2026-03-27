import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // URL untuk redirect utama
  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("code");

  const supabase = await createClient();

  // Penanganan Flow dengan token_hash (Legacy/Email Templates)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Jika tipe adalah recovery, arahkan ke update-password
      if (type === "recovery") {
        redirectTo.pathname = "/auth/update-password";
        return NextResponse.redirect(redirectTo);
      }
      redirectTo.pathname = next;
      return NextResponse.redirect(redirectTo);
    } else {
      redirectTo.pathname = "/auth/error";
      redirectTo.searchParams.set("error", error.message);
      return NextResponse.redirect(redirectTo);
    }
  }

  // Penanganan Flow dengan code (PKCE)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Periksa apakah 'next' diarahkan ke update-password oleh forgot-password-form
      redirectTo.pathname = next;
      return NextResponse.redirect(redirectTo);
    } else {
      redirectTo.pathname = "/auth/error";
      redirectTo.searchParams.set("error", error.message);
      return NextResponse.redirect(redirectTo);
    }
  }

  // Jika tidak ada token_hash atau code
  redirectTo.pathname = "/auth/error";
  redirectTo.searchParams.set("error", "No token hash or code provided");
  return NextResponse.redirect(redirectTo);
}
