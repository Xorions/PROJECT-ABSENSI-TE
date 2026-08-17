"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearAdminVerified } from "@/lib/role";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "click",
  "keydown",
  "touchstart",
] as const;

export function useIdleTimeout(active: boolean) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) return;

    const expireSession = () => {
      localStorage.removeItem("member");
      clearAdminVerified();
      router.push("/login?expired=1");
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(expireSession, IDLE_TIMEOUT_MS);
    };

    const handleActivity = () => resetTimer();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") resetTimer();
    };

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
