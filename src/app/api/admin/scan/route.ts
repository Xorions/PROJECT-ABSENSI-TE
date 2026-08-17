import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ATTENDANCE_POINTS, LATE_PENALTY_POINTS } from "@/lib/points";
import { isValidId, verifyAdminRole } from "@/lib/adminAuth";
import { getNowInTimezone } from "@/lib/date";
import {
  ABSENSI_TIMEZONE,
  deadlineToMinutes,
  getAbsensiDeadline,
} from "@/lib/settings";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function getDeadlineMinutes(
  admin: SupabaseClient,
  date: string
): Promise<number | null> {
  const dbDeadline = await getAbsensiDeadline(admin, date);
  const value = dbDeadline ?? process.env.ABSENSI_DEADLINE ?? "";
  return deadlineToMinutes(value);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const adminId =
    typeof body?.adminId === "string" ? body.adminId.trim() : "";
  const memberId =
    typeof body?.memberId === "string" ? body.memberId.trim() : "";

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

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  if (!(await verifyAdminRole(admin, adminId))) {
    return NextResponse.json(
      { ok: false, error: "Anda tidak memiliki akses admin." },
      { status: 403 }
    );
  }

  const { data: member, error: memberError } = await admin
    .from("members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();

  if (memberError) {
    return NextResponse.json(
      { ok: false, error: "Gagal memuat data anggota." },
      { status: 500 }
    );
  }

  if (!member) {
    return NextResponse.json(
      { ok: false, error: "Anggota tidak ditemukan." },
      { status: 404 }
    );
  }

  const now = getNowInTimezone(ABSENSI_TIMEZONE);
  const deadlineMinutes = await getDeadlineMinutes(admin, now.date);
  const isLate = deadlineMinutes !== null && now.minutes > deadlineMinutes;

  const { data: existingAttendance } = await admin
    .from("attendance")
    .select("id")
    .eq("member_id", memberId)
    .eq("date", now.date)
    .eq("status", "hadir")
    .maybeSingle();

  if (existingAttendance) {
    return NextResponse.json({
      ok: true,
      alreadyPresent: true,
      isLate: false,
      member,
      message: `${member.name} sudah tercatat hadir hari ini.`,
    });
  }

  const { error: insertError } = await admin
    .from("attendance")
    .insert({ member_id: memberId, date: now.date, status: "hadir" });

  if (insertError) {
    return NextResponse.json(
      { ok: false, error: "Gagal mencatat kehadiran." },
      { status: 500 }
    );
  }

  const activity = `attendance-${now.date}`;
  const { data: existingPoint } = await admin
    .from("points")
    .select("id")
    .eq("member_id", memberId)
    .eq("activity", activity)
    .maybeSingle();

  if (!existingPoint) {
    const { error: pointError } = await admin.from("points").insert({
      member_id: memberId,
      activity,
      points: ATTENDANCE_POINTS,
    });

    if (pointError) {
      return NextResponse.json(
        { ok: false, error: "Gagal menambah poin." },
        { status: 500 }
      );
    }

    if (isLate) {
      const { error: lateError } = await admin
        .from("points")
        .update({
          points: ATTENDANCE_POINTS - LATE_PENALTY_POINTS,
          activity: `${activity}-telat`,
        })
        .eq("member_id", memberId)
        .eq("activity", activity);

      if (lateError) {
        return NextResponse.json(
          { ok: false, error: "Gagal menerapkan penalti telat." },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({
    ok: true,
    alreadyPresent: false,
    isLate,
    member,
    message: isLate
      ? `Hadir (Telat -${LATE_PENALTY_POINTS} Poin)`
      : `Absensi tercatat, +${ATTENDANCE_POINTS} poin.`,
  });
}