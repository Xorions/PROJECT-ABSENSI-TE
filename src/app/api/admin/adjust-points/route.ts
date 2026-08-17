import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidId, sanitizeText, verifyAdminRole } from "@/lib/adminAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const MAX_POINTS = 1000;
const MAX_REASON_LENGTH = 200;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const adminId =
    typeof body?.adminId === "string" ? body.adminId.trim() : "";
  const memberId =
    typeof body?.memberId === "string" ? body.memberId.trim() : "";
  const points = typeof body?.points === "number" ? body.points : NaN;
  const reason =
    typeof body?.reason === "string"
      ? sanitizeText(body.reason, MAX_REASON_LENGTH) || null
      : null;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY belum diatur di server." },
      { status: 500 }
    );
  }

  if (!isValidId(adminId)) {
    return NextResponse.json(
      { ok: false, error: "Anda tidak memiliki akses admin." },
      { status: 403 }
    );
  }

  if (!isValidId(memberId)) {
    return NextResponse.json(
      { ok: false, error: "Member tidak valid." },
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(points) ||
    points === 0 ||
    Math.abs(points) > MAX_POINTS
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: `Poin harus angka bulat antara -${MAX_POINTS} dan ${MAX_POINTS}, tidak boleh 0.`,
      },
      { status: 400 }
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  if (!(await verifyAdminRole(admin, adminId))) {
    return NextResponse.json(
      { ok: false, error: "Anda tidak memiliki akses admin." },
      { status: 403 }
    );
  }

  const { error } = await admin.from("adjustments").insert({
    member_id: memberId,
    points,
    reason,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Gagal menyimpan poin." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
