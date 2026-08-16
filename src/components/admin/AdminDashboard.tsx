"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Pencil, Trophy, UserCheck, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { getLocalDate } from "@/lib/date";
import { hasAdminAccess } from "@/lib/role";
import PointsManager from "@/components/admin/PointsManager";
import EditMemberDialog, {
  type MemberRow,
} from "@/components/admin/EditMemberDialog";

type AttendanceWithMember = {
  member_id: string;
  date: string;
  status: string;
  member: { name: string } | null;
};

type MemberCount = {
  member_id: string;
  name: string;
  total: number;
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="gap-3">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="size-4.5" />
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [date, setDate] = useState("");
  const [dayRows, setDayRows] = useState<AttendanceWithMember[]>([]);
  const [perMember, setPerMember] = useState<MemberCount[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [editMember, setEditMember] = useState<MemberRow | null>(null);
  const [memberQuery, setMemberQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasAdminAccess()) {
      router.replace("/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!date) setDate(getLocalDate(new Date()));
  }, [date]);

  useEffect(() => {
    if (!authorized || !date) return;
    (async () => {
      setLoading(true);
      const [dayRes, allRes, memberRes] = await Promise.all([
        supabase
          .from("attendance")
          .select("member_id, date, status, member:members(name)")
          .eq("date", date),
        supabase
          .from("attendance")
          .select("member_id, status, member:members(name)"),
        supabase
          .from("members")
          .select("id, name, division, nim")
          .order("name"),
      ]);

      setDayRows((dayRes.data as AttendanceWithMember[] | null) ?? []);

      if (!allRes.error && allRes.data) {
        const counts = new Map<string, { name: string; total: number }>();
        for (const row of allRes.data as unknown as AttendanceWithMember[]) {
          const entry =
            counts.get(row.member_id) ?? {
              name: row.member?.name ?? row.member_id,
              total: 0,
            };
          entry.total += 1;
          counts.set(row.member_id, entry);
        }
        setPerMember(
          Array.from(counts.entries())
            .map(([member_id, v]) => ({
              member_id,
              name: v.name,
              total: v.total,
            }))
            .sort((a, b) => b.total - a.total)
        );
      } else {
        setPerMember([]);
      }

      setTotalMembers(
        ((memberRes.data as MemberRow[] | null) ?? []).length
      );
      setMembers((memberRes.data as MemberRow[] | null) ?? []);
      setLoading(false);
    })();
  }, [date, authorized]);

  const reloadMembers = async () => {
    const { data } = await supabase
      .from("members")
      .select("id, name, division, nim")
      .order("name");
    setMembers((data as MemberRow[] | null) ?? []);
    setTotalMembers(((data as MemberRow[] | null) ?? []).length);
  };

  if (!authorized) {
    return <p>Memuat...</p>;
  }

  const totalKehadiran = perMember.reduce((s, r) => s + r.total, 0);
  const topStaff = perMember[0];
  const topThree = perMember.slice(0, 3);
  const topThreeIds = new Set(topThree.map((r) => r.member_id));

  const filteredMembers = memberQuery.trim()
    ? members.filter((m) =>
        `${m.name} ${m.id} ${m.division ?? ""} ${m.nim ?? ""}`
          .toLowerCase()
          .includes(memberQuery.trim().toLowerCase())
      )
    : members;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-sm text-muted-foreground">
            Rekap absensi, kehadiran, dan kelola poin anggota dalam satu
            halaman.
          </p>
        </div>
        <div className="w-full max-w-xs space-y-2 sm:w-auto">
          <Label htmlFor="recap-date">Tanggal</Label>
          <Input
            id="recap-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UserCheck}
          label="Hadir Hari Ini"
          value={loading ? "..." : dayRows.length}
          sub={date}
        />
        <StatCard
          icon={CalendarDays}
          label="Total Kehadiran"
          value={loading ? "..." : totalKehadiran}
          sub="Semua waktu"
        />
        <StatCard
          icon={Users}
          label="Anggota Terdaftar"
          value={loading ? "..." : totalMembers}
          sub="Anggota non-admin"
        />
        <StatCard
          icon={Trophy}
          label="Top Kehadiran"
          value={loading ? "..." : topStaff?.total ?? 0}
          sub={topStaff?.name ?? "Belum ada data"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Total Kehadiran per Member</CardTitle>
            <CardDescription>
              Jumlah hari hadir tiap anggota (semua waktu).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Memuat...</p>
            ) : perMember.length === 0 ? (
              <p className="text-muted-foreground">Belum ada data absensi.</p>
            ) : (
              <ol className="divide-y">
                {perMember.map((row, index) => (
                  <li
                    key={row.member_id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      {topThreeIds.has(row.member_id) ? (
                        <span className="text-lg">{["🥇", "🥈", "🥉"][index]}</span>
                      ) : (
                        <span className="w-6 text-sm text-muted-foreground">
                          {index + 1}.
                        </span>
                      )}
                      <span className="truncate font-medium">{row.name}</span>
                    </span>
                    <span
                      className={
                        "shrink-0 text-sm font-semibold " +
                        (topThreeIds.has(row.member_id)
                          ? "text-amber-400"
                          : "text-muted-foreground")
                      }
                    >
                      {row.total}x hadir
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recap Harian</CardTitle>
            <CardDescription>
              {loading
                ? "Memuat data..."
                : `${dayRows.length} anggota tercatat hadir tanggal ${date}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Memuat...</p>
            ) : dayRows.length === 0 ? (
              <p className="text-muted-foreground">
                Belum ada absensi pada tanggal ini.
              </p>
            ) : (
              <ol className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                {dayRows.map((row, index) => (
                  <li
                    key={row.member_id}
                    className="flex items-center justify-between gap-3 border-b border-white/5 py-2.5"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400">
                        {index + 1}
                      </span>
                      <span className="truncate">{row.member?.name ?? row.member_id}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {row.date}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Anggota</CardTitle>
          <CardDescription>
            {loading
              ? "Memuat data..."
              : `${members.length} anggota terdaftar. Klik pensil untuk mengedit data.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={memberQuery}
            onChange={(e) => setMemberQuery(e.target.value)}
            placeholder="Cari nama, ID, devisi, atau NIM"
          />

          {loading ? (
            <p>Memuat...</p>
          ) : filteredMembers.length === 0 ? (
            <p className="text-muted-foreground">
              {memberQuery.trim()
                ? "Tidak ada anggota yang cocok."
                : "Belum ada anggota terdaftar."}
            </p>
          ) : (
            <ol className="max-h-96 divide-y overflow-y-auto pr-1">
              {filteredMembers.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{m.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {m.id}
                      {m.division ? ` · ${m.division}` : ""}
                      {m.nim ? ` · ${m.nim}` : ""}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Edit ${m.name}`}
                    onClick={() => setEditMember(m)}
                  >
                    <Pencil />
                  </Button>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <PointsManager />

      <EditMemberDialog
        member={editMember}
        onOpenChange={(open) => {
          if (!open) setEditMember(null);
        }}
        onSaved={() => void reloadMembers()}
      />
    </div>
  );
}