"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScanDialog from "@/components/admin/ScanDialog";
import {
  getStoredMember,
  isAdmin,
  isAdminVerified,
  clearAdminVerified,
} from "@/lib/role";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import type { Member } from "@/types";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [member, setMember] = useState<Member | null>(null);
  const [verified, setVerified] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  useEffect(() => {
    setMember(getStoredMember());
    setVerified(isAdminVerified());
  }, [pathname]);

  const admin = isAdmin(member) && verified;

  useIdleTimeout(admin);

  const handleLogout = () => {
    localStorage.removeItem("member");
    clearAdminVerified();
    router.push("/login");
  };

  const navLink = (href: string, label: string) => {
    const active =
      pathname === href ||
      (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={
          "rounded-full px-3 py-1.5 text-sm transition-colors " +
          (active
            ? "bg-primary text-primary-foreground"
            : "text-foreground/70 hover:bg-white/5 hover:text-foreground")
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="glass-bar sticky top-0 z-50 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/10 px-4 py-2.5 sm:px-6">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/logo.png"
          alt="Tera Esports"
          width={40}
          height={40}
          className="h-8 w-auto object-contain"
        />
        <div className="leading-tight">
          <span className="block font-bold tracking-wide text-foreground">
            STAFF OF THE MONTH
          </span>
          <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Tera Esports
          </span>
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-1">
        {admin ? (
          <>
            {navLink("/admin", "Dashboard")}
            {navLink("/leaderboard", "Leaderboard")}
          </>
        ) : member ? (
          <>
            {navLink("/card", "QR Card")}
            {navLink("/leaderboard", "Leaderboard")}
          </>
        ) : (
          <>
            {navLink("/login", "Login")}
            {navLink("/leaderboard", "Leaderboard")}
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {admin && (
          <Button
            type="button"
            size="sm"
            onClick={() => setScanOpen(true)}
            className="gap-1.5 bg-gradient-to-r from-pink-500 to-rose-600 font-semibold text-white shadow-lg shadow-pink-500/30 transition-all hover:from-pink-400 hover:to-rose-500 hover:shadow-pink-500/50"
          >
            <QrCode />
            Scan QR
          </Button>
        )}

        {member && (
          <>
            <span className="hidden items-center gap-2 text-sm sm:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {member.name.charAt(0).toUpperCase()}
              </span>
              <span className="leading-tight">
                <span className="block text-foreground/90">{member.name}</span>
                <span
                  className={
                    "block text-[11px] " +
                    (admin ? "text-primary" : "text-muted-foreground")
                  }
                >
                  {admin ? "Admin" : "Staff"}
                </span>
              </span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-white/15 bg-transparent text-foreground/80 hover:bg-white/10 hover:text-foreground"
            >
              Keluar
            </Button>
          </>
        )}
      </div>

      <ScanDialog open={scanOpen} onOpenChange={setScanOpen} />
    </nav>
  );
}