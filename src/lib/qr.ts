import { QR_MAX_AGE_MS } from "@/lib/points";

type QrResult =
  | { ok: true; memberId: string }
  | { ok: false; error: string };

export function parseQrPayload(text: string): QrResult {
  const trimmed = text.trim();

  if (!trimmed.includes("|")) {
    return trimmed ? { ok: true, memberId: trimmed } : { ok: false, error: "QR kosong." };
  }

  const sepIndex = trimmed.lastIndexOf("|");
  const memberId = trimmed.slice(0, sepIndex).trim();
  const tokenStr = trimmed.slice(sepIndex + 1).trim();

  if (!memberId || !tokenStr) {
    return { ok: false, error: "QR tidak valid." };
  }

  const token = Number(tokenStr);
  if (!Number.isFinite(token)) {
    return { ok: false, error: "QR tidak valid." };
  }

  if (Date.now() - token > QR_MAX_AGE_MS) {
    return { ok: false, error: "QR sudah kedaluwarsa, minta anggota refresh E-ID Card." };
  }

  return { ok: true, memberId };
}
