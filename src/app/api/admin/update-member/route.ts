import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidId, sanitizeText, verifyAdminRole } from "@/lib/adminAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const MAX_NAME_LENGTH = 100;
const MAX_TEXT_LENGTH = 100;
const MAX_NIM_LENGTH = 50;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const adminId =
    typeof body?.adminId === "string" ? body.adminId.trim() : "";
  const memberId =
    typeof body?.memberId === "string" ? body.memberId.trim() : "";
  const name =
    typeof body?.name === "string"
      ? sanitizeText(body.name, MAX_NAME_LENGTH)
      : "";
  const division =
    typeof body?.division === "string"
      ? sanitizeText(body.division, MAX_TEXT_LENGTH) || null
      : null;
  const nim =
    typeof body?.nim === "string"
      ? sanitizeText(body.nim, MAX_TEXT_LENGTH).slice(0, MAX_NIM_LENGTH) || null
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

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Nama tidak boleh kosong." },
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
