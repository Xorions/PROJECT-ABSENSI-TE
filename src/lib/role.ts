import type { Member } from "@/types";

export const ADMIN_ROLES = ["Admin", "Panitia", "panitia"];

export const ADMIN_VERIFIED_KEY = "staff-of-the-month-admin-verified";

export function isAdmin(member: Member | null | undefined): boolean {
  return !!member && ADMIN_ROLES.includes(member.role ?? "");
}

export function isAdminVerified(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_VERIFIED_KEY) === "1";
}

export function setAdminVerified() {
  localStorage.setItem(ADMIN_VERIFIED_KEY, "1");
}

export function clearAdminVerified() {
  localStorage.removeItem(ADMIN_VERIFIED_KEY);
}

export function hasAdminAccess(): boolean {
  return isAdmin(getStoredMember()) && isAdminVerified();
}

export function getStoredMember(): Member | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("member");
    return raw ? (JSON.parse(raw) as Member) : null;
  } catch {
    return null;
  }
}
