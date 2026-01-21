import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export const logout = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
};
