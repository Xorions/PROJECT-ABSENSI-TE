"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import QrCodeCard from "@/components/QrCodeCard";
import type { Member } from "@/types";

export default function CardPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("member");
    if (raw) {
      try {
        setMember(JSON.parse(raw));
      } catch {
        setMember(null);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <p>Memuat...</p>;
  }

  if (!member) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>E-ID Card</CardTitle>
          <CardDescription>
            Anda belum login. Silakan login terlebih dahulu untuk melihat E-ID
            Card Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button>Ke Halaman Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <QrCodeCard member={member} />
    </div>
  );
}
