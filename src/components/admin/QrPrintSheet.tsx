"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Download, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button, buttonVariants } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { hasAdminAccess } from "@/lib/role";
import { cn } from "@/lib/utils";

type QrMember = {
  id: string;
  name: string;
  division: string | null;
  nim: string | null;
};

const PER_PAGE = 8;

function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "-");
}

function renderQrPng(member: QrMember): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svg = document.getElementById(`qr-static-${member.id}`);
    if (!svg) {
      reject(new Error("QR tidak ditemukan."));
      return;
    }
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "512");
    clone.setAttribute("height", "512");
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      new XMLSerializer().serializeToString(clone)
    )}`;
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas tidak didukung."));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 32, 32, 448, 448);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Gagal membuat gambar."));
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Gagal memuat QR."));
    img.src = svgUrl;
  });
}

async function downloadMemberQr(member: QrMember) {
  try {
    const blob = await renderQrPng(member);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${member.id}_${safeFileName(member.name)}.png`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    // abaikan, QR tidak tampil di halaman
  }
}

async function downloadAllQrZip(members: QrMember[]): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const nameCount = new Map<string, number>();
  for (const m of members) {
    const base = safeFileName(m.name);
    const count = nameCount.get(base) ?? 0;
    nameCount.set(base, count + 1);
    const filename = `${base}${count > 0 ? ` (${count + 1})` : ""}.png`;
    const blob = await renderQrPng(m);
    zip.file(filename, blob);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "QR_Lanyard.zip";
  a.click();
  URL.revokeObjectURL(url);
}

function QrCard({ member }: { member: QrMember }) {
  return (
    <div className="relative flex aspect-[86/54] flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-card px-3 py-2.5 shadow-lg shadow-black/20 print:aspect-[86/54] print:rounded-none print:border-gray-400 print:bg-white print:text-black print:shadow-none">
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        title={`Download QR ${member.name}`}
        aria-label={`Download QR ${member.name}`}
        onClick={() => downloadMemberQr(member)}
        className="print:hidden absolute right-2 top-2 bg-card"
      >
        <Download />
      </Button>
      <div className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="Tera Esports"
          width={40}
          height={40}
          className="h-7 w-auto rounded-md bg-white p-0.5 object-contain"
        />
        <div className="leading-tight">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-foreground print:text-black">
            Tera Esports
          </p>
          <p className="text-[8px] uppercase tracking-[0.25em] text-muted-foreground print:text-gray-600">
            E-ID Card · Staff of The Month
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-bold print:text-sm print:text-black">
            {member.name}
          </p>
          <p className="truncate text-[10px] text-muted-foreground print:text-gray-700">
            {member.id}
            {member.division ? ` · ${member.division}` : ""}
            {member.nim ? ` · ${member.nim}` : ""}
          </p>
        </div>
        <div className="shrink-0 bg-white p-1">
          <QRCodeSVG
            id={`qr-static-${member.id}`}
            value={member.id}
            size={84}
          />
        </div>
      </div>
    </div>
  );
}

export default function QrPrintSheet() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [members, setMembers] = useState<QrMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [zipping, setZipping] = useState(false);

  useEffect(() => {
    if (!hasAdminAccess()) {
      router.replace("/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    (async () => {
      const { data } = await supabase
        .from("members")
        .select("id, name, division, nim")
        .order("name");
      setMembers((data as QrMember[] | null) ?? []);
      setLoading(false);
    })();
  }, [authorized]);

  const pages: QrMember[][] = [];
  for (let i = 0; i < members.length; i += PER_PAGE) {
    pages.push(members.slice(i, i + PER_PAGE));
  }

  return (
    <div className="print:max-w-none print:p-0">
      <div className="print:hidden flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cetak QR Lanyard</h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Memuat data..."
              : `${members.length} anggota · QR statik berisi ID member · ${
                  PER_PAGE
                } kartu per halaman A4.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Kembali
          </Link>
          <Button
            type="button"
            variant="outline"
            disabled={zipping}
            onClick={() => {
              setZipping(true);
              void downloadAllQrZip(members).finally(() => setZipping(false));
            }}
          >
            <Download />
            {zipping ? "Menyiapkan ZIP..." : "Download Semua (ZIP)"}
          </Button>
          <Button onClick={() => window.print()}>
            <Printer />
            Cetak
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="py-16 text-center text-muted-foreground">Memuat...</p>
      ) : pages.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Belum ada anggota terdaftar.
        </p>
      ) : (
        pages.map((pageMembers, pageIndex) => (
          <div
            key={pageIndex}
            className={cn(
              "grid grid-cols-2 gap-[8mm]",
              pageIndex > 0 && "mt-8 print:break-before-page print:mt-0"
            )}
          >
            {pageMembers.map((m) => (
              <QrCard key={m.id} member={m} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}