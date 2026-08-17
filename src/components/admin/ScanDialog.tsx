"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import QrScanner from "@/components/QrScanner";
import { supabase, useLocal } from "@/lib/supabase";
import { parseQrPayload } from "@/lib/qr";
import { ATTENDANCE_POINTS } from "@/lib/points";
import { getLocalDate } from "@/lib/date";
import type { Member } from "@/types";

const SCAN_LOCK_MS = 3000;

type ScanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ScanDialog({ open, onOpenChange }: ScanDialogProps) {
  const [result, setResult] = useState<Member | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLate, setIsLate] = useState(false);
  const [paused, setPaused] = useState(false);
  const processingRef = useRef(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLock = () => {
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    setMessage(null);
    setPaused(false);
  };

  const handleOpenChange = (next: boolean) => {
    clearLock();
    setResult(null);
    setMessage(null);
    setError(null);
    setIsLate(false);
    onOpenChange(next);
  };

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  const handleScan = async (rawPayload: string) => {
    if (processingRef.current || paused) return;
    processingRef.current = true;
    setError(null);
    setMessage(null);
    setIsLate(false);

    try {
      const parsed = parseQrPayload(rawPayload);
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }

      if (useLocal) {
        const { data: member, error: err } = await supabase
          .from("members")
          .select("*")
          .eq("id", parsed.memberId)
          .maybeSingle();

        if (err) throw err;

        if (!member) {
          setError("Anggota tidak ditemukan.");
          setResult(null);
          return;
        }

        setResult(member);

        const today = getLocalDate(new Date());

        const { data: existingAttendance } = await supabase
          .from("attendance")
          .select("id")
          .eq("member_id", member.id)
          .eq("date", today)
          .eq("status", "hadir")
          .maybeSingle();

        let successMessage: string;

        if (existingAttendance) {
          successMessage = `${member.name} sudah tercatat hadir hari ini.`;
        } else {
          const { error: insertError } = await supabase
            .from("attendance")
            .insert({ member_id: member.id, date: today, status: "hadir" });

          if (insertError) throw insertError;

          const activity = `attendance-${today}`;
          const { data: existingPoint } = await supabase
            .from("points")
            .select("id")
            .eq("member_id", member.id)
            .eq("activity", activity)
            .maybeSingle();

          if (!existingPoint) {
            const { error: pointError } = await supabase.from("points").insert({
              member_id: member.id,
              activity,
              points: ATTENDANCE_POINTS,
            });
            if (pointError) throw pointError;
          }

          successMessage = `Absensi tercatat, +${ATTENDANCE_POINTS} poin.`;
        }

        setMessage(successMessage);
      } else {
        const res = await fetch("/api/admin/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: parsed.memberId }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          setError(data.error ?? "Gagal memproses scan, coba lagi.");
          setResult(null);
          return;
        }

        setResult(data.member ?? null);
        setIsLate(Boolean(data.isLate));
        setMessage(data.message ?? "Absensi tercatat.");
      }

      setPaused(true);
      lockTimerRef.current = setTimeout(() => setPaused(false), SCAN_LOCK_MS);
    } catch {
      setError("Gagal memproses scan, coba lagi.");
    } finally {
      processingRef.current = false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogBackdrop />
      <DialogPopup className="max-w-md">
        <DialogTitle>Scan Absensi</DialogTitle>
        <DialogDescription>
          Arahkan kamera ke QR Code di E-ID Card anggota untuk mencatat
          kehadiran.
        </DialogDescription>

        <div className="mt-4">
          <QrScanner
            autoStart
            paused={paused}
            onScan={handleScan}
            onResume={clearLock}
          />
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {result && message && (
          <div
            className={
              "mt-3 rounded-lg border px-3 py-2.5 " +
              (isLate
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-emerald-500/30 bg-emerald-500/10")
            }
          >
            <p
              className={
                "text-sm font-semibold " +
                (isLate ? "text-amber-400" : "text-emerald-400")
              }
            >
              {result.name}
              <span className="ml-2 font-normal text-muted-foreground">
                {result.id} · {result.organization}
              </span>
            </p>
            <p
              className={
                "mt-0.5 text-sm " +
                (isLate ? "text-amber-300/90" : "text-emerald-300/90")
              }
            >
              {message}
            </p>
          </div>
        )}
      </DialogPopup>
    </Dialog>
  );
}