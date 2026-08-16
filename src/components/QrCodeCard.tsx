"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { Member } from "@/types";

type QrCodeCardProps = {
  member: Member;
};

export default function QrCodeCard({ member }: QrCodeCardProps) {
  const [token, setToken] = useState("");

  useEffect(() => {
    const update = () => setToken(String(Date.now()));
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);

  const qrValue = `${member.id}|${token}`;

  return (
    <Card className="glow-accent mx-auto max-w-sm overflow-hidden border-white/10">
      <CardHeader className="relative rounded-b-none bg-gradient-to-br from-[#ff2e63] via-[#c81e4d] to-[#6f1030] p-6 pb-5 text-primary-foreground">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Tera Esports"
            width={96}
            height={96}
            className="h-10 w-auto rounded-lg border border-white/10 bg-black/30 p-1.5 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          />
          <div className="leading-tight">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">
              Tera Esports
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/80">
              E-ID Card
            </p>
          </div>
        </div>
        <h2 className="mt-4 text-xl font-bold leading-tight">{member.name}</h2>
        <p className="text-sm opacity-80">{member.id}</p>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium">
            {member.organization}
          </span>
          {member.division && (
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium">
              {member.division}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 bg-white pt-6 dark:bg-white">
        <QRCodeSVG value={qrValue} size={200} />
        <CardDescription className="text-center text-neutral-600">
          QR berubah otomatis setiap 60 detik untuk keamanan.
        </CardDescription>
      </CardContent>
    </Card>
  );
}
