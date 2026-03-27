import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // Jika type adalah recovery (reset password), selalu arahkan ke update-password
      if (type === "recovery") {
        return redirect("/auth/update-password");
      }
      return redirect(next);
    } else {
      return redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirect(next);
    } else {
      return redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // If no token_hash or code is present, redirect to error
  return redirect(`/auth/error?error=No token hash or code provided`);
}
