import { createClient } from "@/lib/supabase/server";

export type UserRole = "administrator" | "petugas" | "masyarakat";

/**
 * Get user role from users table
 * @param userId - The user's UUID
 * @returns The user's role or null if not found
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user role:", error);
    return null;
  }

  return data.role as UserRole;
}

/**
 * Get full user data from users table
 * @param userId - The user's UUID
 * @returns User data or null if not found
 */
export async function getUserData(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user data:", error);
    return null;
  }

  return data;
}

/**
 * Check if user has required role
 * @param userId - The user's UUID
 * @param requiredRole - The required role
 * @returns True if user has required role
 */
export async function hasRole(
  userId: string,
  requiredRole: UserRole,
): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === requiredRole;
}
