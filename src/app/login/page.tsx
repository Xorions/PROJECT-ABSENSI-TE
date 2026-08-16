"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { isAdmin, setAdminVerified } from "@/lib/role";
import type { Member } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [pin, setPin] = useState("");
  const [pendingMember, setPendingMember] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let member = pendingMember;

      if (!member) {
        const { data: staffRow } = await supabase
          .from("members")
          .select("*")
          .ilike("name", name.trim())
          .eq("id", id.trim())
          .maybeSingle();

        if (staffRow) {
          member = staffRow as Member;
        } else {
          const { data: adminRow, error: rpcError } = await supabase.rpc(
            "admin_login",
            { p_name: name.trim(), p_id: id.trim() }
          );
          if (rpcError) throw rpcError;
          const candidate = Array.isArray(adminRow) ? adminRow[0] : adminRow;
          member =
            candidate && (candidate as Member).id
              ? (candidate as Member)
              : null;
        }

        if (!member) {
          setError("Nama atau ID tidak ditemukan.");
          setLoading(false);
          return;
        }

        if (isAdmin(member)) {
          setPendingMember(member);
          setLoading(false);
          return;
        }
      }

      if (isAdmin(member)) {
        if (!pin.trim()) {
          setError("Masukkan PIN admin untuk melanjutkan.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/admin-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          setError(data.error ?? "PIN admin salah.");
          setLoading(false);
          return;
        }

        setAdminVerified();
      }

      localStorage.setItem("member", JSON.stringify(member));
      router.push(isAdmin(member) ? "/admin" : "/card");
    } catch {
      setError("Terjadi kesalahan, coba lagi.");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPendingMember(null);
    setPin("");
    setError(null);
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <Image
          src="/logo.png"
          alt="Tera Esports"
          width={80}
          height={80}
          className="mx-auto h-16 w-auto object-contain drop-shadow-[0_0_24px_rgba(255,46,99,0.4)]"
        />
        <h1 className="mt-4 text-2xl font-black tracking-tight">
          <span className="text-gradient">Staff of The Month</span>
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.4em] text-primary">
          Tera Esports
        </p>
      </div>
      <Card className="border-white/10 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>Login Anggota</CardTitle>
        <CardDescription>
          Masukkan nama dan ID anggota Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ashilah Tsabitah Fitr"
              disabled={!!pendingMember}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="id">ID Anggota</Label>
            <Input
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Contoh: TE-00000"
              disabled={!!pendingMember}
              required
            />
          </div>

          {pendingMember && isAdmin(pendingMember) && (
            <div className="space-y-2">
              <Label htmlFor="pin">PIN Admin</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN rahasia admin"
                autoFocus
                required
              />
              <p className="text-xs text-muted-foreground">
                Akun {pendingMember.name} terdeteksi sebagai admin. Masukkan PIN
                untuk melanjutkan.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Memuat..." : pendingMember ? "Verifikasi PIN" : "Masuk"}
            </Button>
            {pendingMember && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={loading}
              >
                Ubah
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  );
}
