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
  const name =
    typeof body?.name === "string" ? body.name.trim() : "";
  const division =
    typeof body?.division === "string" ? body.division.trim() : null;
  const nim =
    typeof body?.nim === "string" ? body.nim.trim() : null;

  if (!memberId) {
    return NextResponse.json(
      { ok: false, error: "Member tidak valid." },
      { status: 400 }
    );
  }

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Nama tidak boleh kosong." },
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

  const { error } = await admin
    .from("members")
    .update({ name, division, nim })
    .eq("id", memberId);

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Gagal memperbarui data anggota." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}