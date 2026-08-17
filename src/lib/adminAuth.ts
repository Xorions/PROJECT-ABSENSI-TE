import type { SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_ROLES } from "@/lib/role";

const ID_PATTERN = /^[A-Za-z0-9_-]{1,50}$/;

export function isValidId(value: string): boolean {
  return ID_PATTERN.test(value);
}

export async function verifyAdminRole(
  admin: SupabaseClient,
  adminId: string
): Promise<boolean> {
  if (!isValidId(adminId)) return false;
  const { data, error } = await admin
    .from("members")
    .select("role")
    .eq("id", adminId)
    .maybeSingle();
  if (error || !data) return false;
  return ADMIN_ROLES.includes(String(data.role ?? ""));
}

export function sanitizeText(value: string, maxLength: number): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
