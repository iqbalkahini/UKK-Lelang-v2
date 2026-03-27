import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const supabase = await createClient();

  // Handler untuk token_hash (recovery/verification)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    console.log(error)
    const redirectPath = !error && type === "recovery"
      ? "/auth/update-password"
      : !error ? "/" : `/auth/error?error=${encodeURIComponent(error.message)}`;
    return redirect(redirectPath);
  }

  // Handler untuk code (PKCE)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return redirect(error ? `/auth/error?error=${encodeURIComponent(error.message)}` : "/");
  }

  // Default error
  return redirect("/auth/error?error=No token hash or code provided");
}