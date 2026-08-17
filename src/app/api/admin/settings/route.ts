import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidId, verifyAdminRole } from "@/lib/adminAuth";
import { getNowInTimezone } from "@/lib/date";
import {
  ABSENSI_TIMEZONE,
  isDeadlineTime,
  getAbsensiDeadline,
  setAbsensiDeadline,
  clearAbsensiDeadline,
} from "@/lib/settings";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

type DeadlineSource = "db" | "env" | "none";

async function ensureAdmin(request: Request, body?: Record<string, unknown>) {
  if (!supabaseUrl || !serviceRoleKey) {
    return {
      admin: null,
      response: NextResponse.json(
        {
          ok: false,
          error: "SUPABASE_SERVICE_ROLE_KEY belum diatur di server.",
        },
        { status: 500 }
      ),
    };
  }

  let adminId: string;
  if (request.method === "GET") {
    adminId = new URL(request.url).searchParams.get("adminId")?.trim() ?? "";
  } else {
    adminId =
      typeof body?.adminId === "string" ? body.adminId.trim() : "";
  }

  if (!isValidId(adminId)) {
    return {
      admin: null,
      response: NextResponse.json(
        { ok: false, error: "Anda tidak memiliki akses admin." },
        { status: 403 }
      ),
    };
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  if (!(await verifyAdminRole(admin, adminId))) {
    return {
      admin: null,
      response: NextResponse.json(
        { ok: false, error: "Anda tidak memiliki akses admin." },
        { status: 403 }
      ),
    };
  }

  return { admin, response: null };
}

export async function GET(request: Request) {
  const { admin, response } = await ensureAdmin(request);
  if (response) return response;

  const envDeadline = (process.env.ABSENSI_DEADLINE ?? "").trim();
  const now = getNowInTimezone(ABSENSI_TIMEZONE);
  const dbDeadline = await getAbsensiDeadline(admin!, now.date);

  let deadline: string | null;
  let source: DeadlineSource;
  if (dbDeadline) {
    deadline = dbDeadline;
    source = "db";
  } else if (isDeadlineTime(envDeadline)) {
    deadline = envDeadline;
    source = "env";
  } else {
    deadline = null;
    source = "none";
  }

  return NextResponse.json({
    ok: true,
    date: now.date,
    deadline,
    source,
    envDeadline: envDeadline || null,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { admin, response } = await ensureAdmin(request, body);
  if (response) return response;

  const deadline =
    typeof body?.deadline === "string" ? body.deadline.trim() : "";

  if (deadline && !isDeadlineTime(deadline)) {
    return NextResponse.json(
      { ok: false, error: "Format jam tidak valid (harus HH:mm)." },
      { status: 400 }
    );
  }

  const now = getNowInTimezone(ABSENSI_TIMEZONE);
  const adminId =
    typeof body?.adminId === "string" ? body.adminId.trim() : "";

  const ok = deadline
    ? await setAbsensiDeadline(admin!, now.date, deadline, adminId)
    : await clearAbsensiDeadline(admin!, now.date);

  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Gagal menyimpan pengaturan." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    date: now.date,
    deadline: deadline || null,
    source: "db" as DeadlineSource,
  });
}
