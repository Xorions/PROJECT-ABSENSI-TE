import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ATTENDANCE_POINTS, LATE_PENALTY_POINTS } from "@/lib/points";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ABSENSI_TIMEZONE = process.env.ABSENSI_TIMEZONE || "Asia/Jakarta";

type NowInZone = { date: string; minutes: number };

function getNowInTimezone(): NowInZone {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: ABSENSI_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );

  let hour = parts.hour;
  if (hour === "24") hour = "00";
  const minutes = Number(hour) * 60 + Number(parts.minute);

  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes };
}

function getDeadlineMinutes(): number | null {
  const raw = process.env.ABSENSI_DEADLINE;
  if (!raw) return null;
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const memberId =
    typeof body?.memberId === "string" ? body.memberId.trim() : "";

  if (!memberId) {
    return NextResponse.json(
      { ok: false, error: "Member tidak valid." },
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

  const now = getNowInTimezone();
  const deadlineMinutes = getDeadlineMinutes();
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