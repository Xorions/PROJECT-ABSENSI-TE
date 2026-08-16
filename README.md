# Staff of The Month

Aplikasi keanggotaan organisasi esports (Tera Esports) dengan login, E-ID Card + QR Code dinamis, absensi via scan QR, rekap absensi, pengelolaan poin manual oleh admin, dan Leaderboard Staff of The Month.

Tampilan: tema **dark** dengan aksen **maroon/cream** (logo sementara di `public/logo.svg`).

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router) + React 18 + TypeScript
- [Supabase](https://supabase.com/) sebagai database (PostgreSQL) + Row Level Security
- [html5-qrcode](https://www.npmjs.com/package/html5-qrcode) untuk scanner QR via kamera
- Tailwind CSS v4 + shadcn/ui

## Struktur Project

```
staff-of-the-month/
├── public/
│   └── logo.svg               # Logo placeholder (monogram "TE")
├── src/
│   ├── app/                   # Routing halaman (Next.js App Router)
│   │   ├── layout.tsx         # Template utama & layout global
│   │   ├── page.tsx           # Halaman utama (Landing Hero)
│   │   ├── globals.css        # Theme dark maroon/cream (token oklch)
│   │   ├── login/             # Halaman Login (Nama + ID, PIN utk admin)
│   │   ├── card/              # Halaman E-ID Card & Dynamic QR Anggota
│   │   ├── leaderboard/       # Halaman Peringkat & Staff of the Month
│   │   ├── admin/
│   │   │   ├── scan/          # Scanner QR Khusus Admin/Panitia
│   │   │   ├── recap/         # Rekap Absensi (per tanggal & per member)
│   │   │   └── points/        # Kelola poin manual (+/-) oleh admin
│   │   └── api/
│   │       ├── admin-verify/        # Verifikasi PIN admin (server-side)
│   │       └── admin/adjust-points/ # Tambah/kurangi poin (server-side)
│   ├── components/            # Component UI re-usable
│   ├── lib/                   # Supabase client, role/auth, QR, poin, date
│   └── types/index.ts         # Tipe data Member, Absen, Poin
├── supabase/
│   └── schema.sql             # Skema tabel, RLS, dan RPC admin_login
├── .env.local                 # API Key & PIN admin (tidak di-commit ke git)
├── package.json
├── AGENTS.md                  # Pedoman agent untuk pengembangan
└── README.md
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Jalankan development server:

   ```bash
   npm run dev
   ```

3. Buka http://localhost:3000. Contoh login (placeholder): `Ashilah Tsabitah Fitr` / `TE-00000` = admin (Panitia). ID contoh tidak ada di DB live — gunakan data asli dari tabel `members` untuk terhubung ke Supabase.

## Mode Lokal (tanpa Supabase)

Jika `.env.local` masih kosong, aplikasi otomatis memakai **local database mock**:
data member, absen, dan poin disimpan di `localStorage` browser sehingga
semua fitur (login, E-ID Card + QR, scan, leaderboard) bisa diuji tanpa
Supabase. Ada banner kuning + tombol **Reset Data** di atas halaman.

Untuk menghubungkan Supabase (mode produksi):

1. Buka **Supabase → SQL Editor**, jalankan `supabase/schema.sql` (tabel +
   contoh data + RLS + RPC `admin_login`).
2. Isi `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ADMIN_PIN=pin-rahasia-admin
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   > `SUPABASE_SERVICE_ROLE_KEY` wajib untuk fitur kelola poin manual (dipercaya penuh, hanya dipakai server-side lewat API route).

3. Restart `npm run dev`. Banner mode lokal akan hilang.

## Sistem Poin

- **Hadir acara (scan QR):** +10 poin per hari (tidak bisa dobel).
- **Kelola poin manual (admin):** halaman `/admin/points` untuk menambah/mengurangi
  poin dengan alasan; tersimpan di tabel `adjustments`. Total poin di leaderboard = jumlah `points` + `adjustments`.
- QR E-ID Card berisi `id|timestamp` dan berputar tiap 60 detik. Scanner
  menolak QR yang berumur lebih dari 90 detik.
- Halaman admin (scan, recap, poin) hanya bisa diakses role admin
  (`Panitia`/`Admin`) setelah verifikasi PIN.

## Keamanan & RLS

- Admin **tidak terlihat** oleh member biasa: RLS membatasi select `members` untuk anon hanya ke baris non-admin; login admin memakai RPC `admin_login`.
- `adjustments` hanya bisa di-select anon; penulisan hanya lewat API dengan service role key.
- Verifikasi PIN admin dilakukan server-side (`/api/admin-verify`), bukan di browser.

## Skema Tabel Supabase

- `members` — id (PK), name, phone, organization, role, division, joined_at
- `attendance` — id, member_id, date, status, unique(member_id, date, status)
- `points` — id, member_id, activity, points, created_at, unique(member_id, activity)
- `adjustments` — id, member_id, points (tidak 0), reason, created_at

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Di Vercel: **Import Project** → pilih repo.
3. Set keempat env var (lihat bagian Setup) di **Settings → Environment Variables**.
4. Deploy. `.env.local` tidak ikut ter-upload, jadi env Vercel wajib diisi manual.
