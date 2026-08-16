"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { PointRow } from "@/types";

type PointWithMember = PointRow & {
  member: { name: string } | null;
};

type Ranking = {
  member_id: string;
  name: string;
  total: number;
};

const MEDALS = [
  { ring: "oklch(0.88 0.05 75 / 0.6)", color: "oklch(0.88 0.05 75)", label: "🥇" },
  { ring: "oklch(0.72 0.01 25 / 0.6)", color: "oklch(0.78 0.01 25)", label: "🥈" },
  { ring: "oklch(0.46 0.15 18 / 0.6)", color: "oklch(0.55 0.16 18)", label: "🥉" },
];

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [pointsRes, adjRes] = await Promise.all([
        supabase
          .from("points")
          .select("member_id, points, member:members(name)")
          .order("points", { ascending: false }),
        supabase
          .from("adjustments")
          .select("member_id, points, member:members(name)"),
      ]);

      const grouped = new Map<string, number>();
      const names = new Map<string, string>();

      const addRows = (rows: PointWithMember[]) => {
        for (const row of rows) {
          grouped.set(
            row.member_id,
            (grouped.get(row.member_id) ?? 0) + row.points
          );
          if (row.member?.name) names.set(row.member_id, row.member.name);
        }
      };

      if (!pointsRes.error && pointsRes.data) {
        addRows(pointsRes.data as unknown as PointWithMember[]);
      }
      if (!adjRes.error && adjRes.data) {
        addRows(adjRes.data as unknown as PointWithMember[]);
      }

      const rankings: Ranking[] = Array.from(grouped.entries()).map(
        ([member_id, total]) => ({
          member_id,
          name: names.get(member_id) ?? member_id,
          total,
        })
      );

      setRows(rankings.sort((a, b) => b.total - a.total));
      setLoading(false);
    })();
  }, []);

  const winner = rows[0];
  const podium = rows.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-primary">
          Tera Esports
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          <span className="text-gradient">LEADERBOARD</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Peringkat anggota berdasarkan poin kegiatan.
        </p>
      </div>

      {winner && (
        <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-card p-8 text-center">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative">
            <div className="text-4xl">🏆</div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              Staff of The Month
            </p>
            <p className="mt-2 text-3xl font-black text-gradient">
              {winner.name}
            </p>
            <p className="mt-1 font-semibold text-foreground/90">
              {winner.total} poin
            </p>
          </div>
        </div>
      )}

      {podium.length >= 2 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 0, 2].map((slot) => {
            const entry = podium[slot];
            if (!entry) return null;
            const medal = MEDALS[slot];
            const isWinner = slot === 0;
            return (
              <div
                key={entry.member_id}
                className="rounded-2xl border bg-card p-5 text-center"
                style={{
                  borderColor: isWinner ? medal.ring : "oklch(1 0 0 / 10%)",
                  boxShadow: isWinner
                    ? "0 0 40px -12px oklch(0.653 0.238 13.8 / 0.6)"
                    : "none",
                }}
              >
                <div
                  className="mx-auto flex size-12 items-center justify-center rounded-full text-xl"
                  style={{
                    background: `${medal.color}1f`,
                    color: medal.color,
                  }}
                >
                  {medal.label}
                </div>
                <p className="mt-3 truncate font-bold">
                  {isWinner ? "1st" : slot === 1 ? "2nd" : "3rd"}
                </p>
                <p className="truncate text-sm text-foreground/80">
                  {entry.name}
                </p>
                <p
                  className="mt-1 text-sm font-semibold"
                  style={{ color: medal.color }}
                >
                  {entry.total} poin
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Card className="border-white/10">
        <CardContent>
          {loading ? (
            <p className="py-6 text-center text-muted-foreground">Memuat...</p>
          ) : rows.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Belum ada data poin.
            </p>
          ) : (
            <ol className="divide-y divide-white/5">
              {rows.map((row, index) => {
                const medal = MEDALS[index];
                return (
                  <li
                    key={row.member_id}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={
                          medal
                            ? { color: medal.color, background: `${medal.color}1f` }
                            : {
                                color: "oklch(0.7 0.02 75)",
                                background: "oklch(1 0 0 / 6%)",
                              }
                        }
                      >
                        {index + 1}
                      </span>
                      <span className="truncate">{row.name}</span>
                    </span>
                    <span className="ml-3 shrink-0 text-muted-foreground">
                      {row.total} poin
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
