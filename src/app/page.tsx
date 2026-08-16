"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getStoredMember, isAdmin, isAdminVerified } from "@/lib/role";
import type { Member } from "@/types";

export default function Home() {
  const [member, setMember] = useState<Member | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setMember(getStoredMember());
    setVerified(isAdminVerified());
  }, []);

  const admin = isAdmin(member) && verified;

  const primaryAction = admin
    ? { href: "/admin", label: "Dashboard Admin" }
    : member
      ? { href: "/card", label: "Tampilkan QR Card" }
      : { href: "/login", label: "Masuk" };

  return (
    <div className="mx-auto max-w-3xl">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-card p-8 text-center sm:p-12">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />

        <div className="relative">
          <Image
            src="/logo.png"
            alt="Tera Esports"
            width={96}
            height={96}
            className="mx-auto h-20 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,46,99,0.45)]"
            priority
          />

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.45em] text-primary">
            Tera Esports
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            <span className="text-gradient">STAFF OF THE MONTH</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Sistem absensi organisasi: login dulu, scan QR untuk mencatat
            kehadiran, raih poin, dan naiki leaderboard untuk jadi yang
            terbaik bulan ini.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={primaryAction.href}>
              <Button size="lg" className="glow-accent font-semibold">
                {primaryAction.label}
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button
                size="lg"
                variant="outline"
                className="border-white/15 font-semibold hover:bg-white/5"
              >
                Lihat Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-card p-5 text-center">
          <div className="text-2xl">🏆</div>
          <h3 className="mt-2 font-semibold">Poin</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Kumpulkan poin dari setiap kehadiran.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card p-5 text-center">
          <div className="text-2xl">🎯</div>
          <h3 className="mt-2 font-semibold">Leaderboard</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau peringkatmu secara real-time.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card p-5 text-center">
          <div className="text-2xl">⚡</div>
          <h3 className="mt-2 font-semibold">Cepat</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan QR sekejap, tanpa antre.
          </p>
        </div>
      </section>
    </div>
  );
}
