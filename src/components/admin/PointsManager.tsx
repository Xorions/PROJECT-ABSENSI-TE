"use client";

import { useState } from "react";
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
import type { Member } from "@/types";

type AdjustRow = {
  points: number;
  reason: string | null;
  created_at: string;
};

const QUICK_ADJUSTS = [10, 5, -5, -10];

export default function PointsManager() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Member | null>(null);
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<AdjustRow[]>([]);
  const [customAmount, setCustomAmount] = useState("10");
  const [reason, setReason] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadMember = async (member: Member) => {
    setSelected(member);
    setError(null);
    setMessage(null);
    setLoading(true);

    const [att, adj] = await Promise.all([
      supabase.from("points").select("points").eq("member_id", member.id),
      supabase
        .from("adjustments")
        .select("points, reason, created_at")
        .eq("member_id", member.id)
        .order("created_at", { ascending: false }),
    ]);

    const attSum = ((att.data as { points: number }[] | null) ?? []).reduce(
      (s, r) => s + (r.points ?? 0),
      0
    );
    const adjSum = ((adj.data as AdjustRow[] | null) ?? []).reduce(
      (s, r) => s + (r.points ?? 0),
      0
    );

    setTotal(attSum + adjSum);
    setHistory((adj.data as AdjustRow[] | null) ?? []);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("members")
      .select("id, name, division")
      .or(`name.ilike.%${q}%,id.ilike.%${q}%`)
      .limit(10);

    setSearching(false);
    if (err) {
      setError("Gagal mencari anggota.");
      setResults([]);
      return;
    }
    setResults((data as Member[] | null) ?? []);
  };

  const applyAdjust = async (amount: number) => {
    if (!selected) return;
    if (!pin.trim()) {
      setError("Masukkan PIN admin terlebih dahulu.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/adjust-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selected.id,
          points: amount,
          reason,
          adminPin: pin,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Gagal menyimpan poin.");
        return;
      }

      setReason("");
      setMessage(
        `${amount > 0 ? "+" : ""}${amount} poin untuk ${selected.name}.`
      );
      await loadMember(selected);
    } catch {
      setError("Terjadi kesalahan, coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Kelola Poin Anggota</CardTitle>
          <CardDescription>
            Cari anggota, lalu tambah/kurangi poin (hadir pertama, telat, dll).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau ID anggota"
            />
            <Button type="submit" disabled={searching}>
              {searching ? "Mencari..." : "Cari"}
            </Button>
          </form>

          {results.length > 0 && !selected && (
            <ul className="divide-y rounded-lg border">
              {results.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setResults([]);
                      setQuery("");
                      void loadMember(m);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-muted"
                  >
                    <span className="font-medium">{m.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {m.id}
                      {m.division ? ` · ${m.division}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {results.length === 0 && !selected && query && !searching && (
            <p className="text-sm text-muted-foreground">
              Tidak ada anggota ditemukan.
            </p>
          )}

          {selected && (
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Poin Saat Ini
                  </p>
                  <p className="text-3xl font-bold">
                    {loading ? "..." : total}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(null)}
                >
                  Ganti Anggota
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Tambahkan / Kurangi Poin</Label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ADJUSTS.map((amount) => (
                    <Button
                      key={amount}
                      variant={amount > 0 ? "default" : "destructive"}
                      onClick={() => void applyAdjust(amount)}
                      disabled={saving || loading}
                    >
                      {amount > 0 ? `+${amount}` : amount}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <div>
                    <Label htmlFor="custom-amount">Jumlah Lain</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-28"
                    />
                  </div>
                  <div className="min-w-40 flex-1">
                    <Label htmlFor="reason">Alasan (opsional)</Label>
                    <Input
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="cth: bonus hadir pertama"
                    />
                  </div>
                  <Button
                    onClick={() => void applyAdjust(Number(customAmount))}
                    disabled={saving || loading}
                  >
                    Terapkan
                  </Button>
                </div>
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="admin-pin">PIN Admin</Label>
                  <Input
                    id="admin-pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN rahasia admin"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {message && <p className="text-sm text-emerald-400">{message}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Penyesuaian</CardTitle>
          <CardDescription>
            {selected
              ? `Penyesuaian manual untuk ${selected.name}.`
              : "Pilih anggota terlebih dahulu untuk melihat riwayatnya."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Memuat...</p>
          ) : history.length === 0 ? (
            <p className="text-muted-foreground">
              {selected
                ? "Belum ada penyesuaian manual."
                : "Belum ada anggota dipilih."}
            </p>
          ) : (
            <ol className="max-h-96 divide-y overflow-y-auto pr-1">
              {history.map((row) => (
                <li
                  key={row.created_at}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <span
                      className={
                        row.points > 0
                          ? "font-bold text-emerald-400"
                          : "font-bold text-destructive"
                      }
                    >
                      {row.points > 0 ? `+${row.points}` : row.points}
                    </span>
                    {row.reason && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {row.reason}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString("id-ID")}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}