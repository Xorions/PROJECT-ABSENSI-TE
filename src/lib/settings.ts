import type { SupabaseClient } from "@supabase/supabase-js";

export const ABSENSI_TIMEZONE =
  process.env.ABSENSI_TIMEZONE || "Asia/Jakarta";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isDeadlineTime(value: string): boolean {
  return TIME_PATTERN.test(value.trim());
}

export function deadlineToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function deadlineKey(date: string): string {
  return `absensi_deadline:${date}`;
}

export async function getAbsensiDeadline(
  admin: SupabaseClient,
  date: string
): Promise<string | null> {
  const { data } = await admin
    .from("settings")
    .select("value")
    .eq("key", deadlineKey(date))
    .maybeSingle();
  const value = data?.value;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function setAbsensiDeadline(
  admin: SupabaseClient,
  date: string,
  deadline: string,
  updatedBy: string
): Promise<boolean> {
  const { error } = await admin.from("settings").upsert(
    {
      key: deadlineKey(date),
      value: deadline,
      updated_by: updatedBy,
    },
    { onConflict: "key" }
  );
  return !error;
}

export async function clearAbsensiDeadline(
  admin: SupabaseClient,
  date: string
): Promise<boolean> {
  const { error } = await admin
    .from("settings")
    .delete()
    .eq("key", deadlineKey(date));
  return !error;
}
