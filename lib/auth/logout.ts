"use client";

// useLogout.ts
import { useRouter } from "next/navigation";
import { createClient } from "../supabase/client";

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return logout;
}
