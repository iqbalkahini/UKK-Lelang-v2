"use server";

import { redirect } from "next/navigation";
import { getUserRole } from "./role";

export async function redirectAfterLogin() {
  const role = await getUserRole();

  if (role === "admin") {
    redirect("/admin/dashboard");
  } else if (role === "petugas") {
    redirect("/petugas/dashboard");
  } else if (role === "masyarakat") {
    redirect("/dashboard");
  } else {
    // Default fallback if role is null or unrecognized
    redirect("/dashboard");
  }
}
