"use client";

import { STORAGE_KEY } from "@/lib/localDb";

export default function LocalModeBanner() {
  const reset = () => {
    if (window.confirm("Reset semua data lokal (member, absen, poin)?")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("member");
      window.location.reload();
    }
  };

  return (
    <div className="print:hidden flex items-center justify-center gap-3 bg-amber-400 px-4 py-1.5 text-center text-xs font-medium text-amber-950">
      <span>
        Mode Lokal: data tersimpan di browser, belum tersambung Supabase.
      </span>
      <button
        onClick={reset}
        className="rounded bg-amber-600/20 px-2 py-0.5 text-amber-950 underline hover:bg-amber-600/30"
      >
        Reset Data
      </button>
    </div>
  );
}
