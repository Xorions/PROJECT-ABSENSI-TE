"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type QrScannerProps = {
  onScan: (rawPayload: string) => void;
  onResume?: () => void;
  autoStart?: boolean;
  paused?: boolean;
};

export default function QrScanner({
  onScan,
  onResume,
  autoStart,
  paused,
}: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const pausedRef = useRef(!!paused);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    startedRef.current = false;
    setStarted(false);

    if (!scanner) return;
    try {
      await scanner.stop();
    } catch {
      // kamera sudah berhenti / belum pernah dimulai
    }
    try {
      scanner.clear();
    } catch {
      // abaikan error saat clear
    }
  };

  const startScanner = async () => {
    if (startedRef.current || pausedRef.current) return;
    setError(null);
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (pausedRef.current) return;
          onScan(decodedText.trim());
        },
        () => {}
      );
      startedRef.current = true;
      setStarted(true);
    } catch {
      scannerRef.current = null;
      startedRef.current = false;
      setError(
        "Tidak dapat mengakses kamera. Pastikan izin kamera diberikan."
      );
      setStarted(false);
    }
  };

  useEffect(() => {
    pausedRef.current = !!paused;
    if (paused) {
      void stopScanner();
    } else if (autoStart && !startedRef.current) {
      void startScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, autoStart]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div id="qr-reader" className="mx-auto w-full max-w-sm" />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex flex-col items-center gap-2">
          {paused ? (
            <>
              <p className="text-sm text-muted-foreground">
                Scanner dijeda, siap untuk anggota berikutnya.
              </p>
              <Button onClick={onResume}>Lanjut Scan</Button>
            </>
          ) : started ? (
            <Button variant="destructive" onClick={stopScanner}>
              Stop Scanner
            </Button>
          ) : (
            <Button onClick={startScanner}>Mulai Scan</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}