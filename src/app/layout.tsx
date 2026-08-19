import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import LocalModeBanner from "@/components/LocalModeBanner";
import { useLocal } from "@/lib/supabase";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Staff of The Month",
  description:
    "Sistem absensi, E-ID Card QR, dan leaderboard organisasi Tera Esports",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        {useLocal && <LocalModeBanner />}
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8 print:max-w-none print:p-0">
          {children}
        </main>
      </body>
    </html>
  );
}
