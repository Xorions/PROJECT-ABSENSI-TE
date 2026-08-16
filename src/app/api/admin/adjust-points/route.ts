import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (
    typeof body?.adminPin !== "string" ||
    !process.env.ADMIN_PIN ||
    body.adminPin.trim() !== process.env.ADMIN_PIN
  ) {
    return NextResponse.json(
      { ok: false, error: "PIN admin salah." },
      { status: 401 }
    );
  }

  const memberId =
    typeof body?.memberId === "string" ? body.memberId.trim() : "";
  const points = Number(body?.points);
  const reason =
    typeof body?.reason === "string" && body.reason.trim()
      ? body.reason.trim()
      : null;

  if (!memberId) {
    return NextResponse.json(
      { ok: false, error: "Member tidak valid." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(points) || points === 0) {
    return NextResponse.json(
      { ok: false, error: "Poin harus angka bulat, tidak boleh 0." },
      { status: 400 }
    );
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY belum diatur di server." },
      { status: 500 }
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

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
