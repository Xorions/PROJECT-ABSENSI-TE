"use client";

import { useEffect, useState } from "react";
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
import { getStoredMember } from "@/lib/role";

type DeadlineSource = "db" | "env" | "none" | null;

export default function DeadlineSettings() {
  const [deadline, setDeadline] = useState("");
  const [source, setSource] = useState<DeadlineSource>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const adminId = getStoredMember()?.id;
      if (!adminId) return;
      const res = await fetch(
        `/api/admin/settings?adminId=${encodeURIComponent(adminId)}`
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDeadline(data.deadline ?? "");
        setSource((data.source as DeadlineSource) ?? null);
      } else {
        setError(data.error ?? "Gagal memuat pengaturan.");
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    const adminId = getStoredMember()?.id;
    if (!adminId) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, deadline }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Gagal menyimpan pengaturan.");
        return;
      }

      setSource("db");
      setMessage(
        deadline
          ? `Jam deadline hari ini disimpan: ${deadline}.`
          : "Jam deadline hari ini dihapus (kembali ke default server)."
      );
    } catch {
      setError("Terjadi kesalahan, coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Jam Deadline Absensi
        </CardTitle>
        <CardDescription>
          {source === "db"
            ? "Deadline khusus hari ini (diubah admin)."
            : source === "env"
              ? "Memakai default server (ABSENSI_DEADLINE)."
              : source === "none"
                ? "Deadline tidak diatur — tanpa penalti telat."
                : "Memuat pengaturan..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="absensi-deadline">Deadline (HH:mm)</Label>
        <div className="flex flex-wrap items-end gap-2">
          <Input
            id="absensi-deadline"
            type="time"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={loading}
            className="w-36"
          />
          <Button
            onClick={() => void handleSave()}
            disabled={saving || loading}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-emerald-400">{message}</p>}
      </CardContent>
    </Card>
  );
}
