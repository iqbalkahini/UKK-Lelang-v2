import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "petugas" | "masyarakat" | null;

export async function getUserRole(): Promise<UserRole> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Cek tabel 'users' untuk mendapatkan role dasar
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) return null;

  if (userData.role === "masyarakat") {
    return "masyarakat";
  }

  // 2. Jika role di 'users' adalah 'petugas', cek detail di 'tb_petugas' dan 'tb_level'
  if (userData.role === "petugas") {
    const { data: petugasData, error: petugasError } = await supabase
      .from("tb_petugas")
      .select(
        `
        level:tb_level (
          level
        )
      `,
      )
      .eq("user_id", user.id)
      .single();

    if (petugasError || !petugasData) return null;

    // Mapping level dari database ke role aplikasi
    // Asumsi: tb_level.level berisi 'administrator' atau 'petugas'
    // @ts-ignore
    const levelName = petugasData.level?.level;

    if (levelName === "administrator") return "admin";
    if (levelName === "petugas") return "petugas";
  }

  return null;
}
