"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearAdminVerified } from "@/lib/role";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const LAST_ACTIVITY_KEY = "last_activity_timestamp";

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "click",
  "keydown",
  "touchstart",
] as const;

function getLastActivityMs(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function useIdleTimeout(active: boolean) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) return;

    const saveLastActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    };

    const expireSession = () => {
      localStorage.removeItem("member");
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      clearAdminVerified();
      router.push("/login?expired=1");
    };

    const isExpired = () => {
      const last = getLastActivityMs();
      return last > 0 && Date.now() - last > IDLE_TIMEOUT_MS;
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(expireSession, IDLE_TIMEOUT_MS);
    };

    const handleActivity = () => {
      saveLastActivity();
      resetTimer();
    };

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (isExpired()) {
        expireSession();
        return;
      }
      resetTimer();
    };

    if (getLastActivityMs() === 0) saveLastActivity();

    if (isExpired()) {
      expireSession();
      return;
    }

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [active, router]);
}
