# OpenCode Agent Guidelines - Organization Web App

## 1. Project Overview
A web application for organization member management (esports org "Tera Esports") featuring:
- Member login via Name & Unique ID.
- Role-based access: admin (role `Panitia`/`Admin`) gets QR Scanner + attendance recap + manual points; staff gets QR card + leaderboard.
- Digital E-ID Card generation with QR Code (rotates every 60s).
- Automated point calculation & Leaderboard (Staff of the Month).
- Admin attendance recap (`/admin`): unified admin dashboard with per-date list, per-member total attendance, and points management on a single page.
- Manual point adjustment (in `/admin` dashboard): admin can add/subtract points with reason + PIN.
- QR scanning for admin lives in a modal dialog (triggered by the "Scan QR" button in the navbar) — no separate scan route; the modal records attendance via `POST /api/admin/scan` (server-side, service role key).

## 2. Tech Stack & Libraries
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database & Auth:** Supabase (PostgreSQL) with Row Level Security
- **QR Code Generator:** `qrcode.react`
- **QR Code Scanner:** `html5-qrcode`
- **Deployment:** Vercel

## 3. Directory Structure
Always follow this folder structure:
- `src/app/` -> Next.js pages and API routes
- `src/components/` -> Reusable UI components (`ui/` = shadcn primitives, `admin/` = admin dashboard pieces)
- `src/lib/` -> Supabase client & utility functions
- `src/types/` -> TypeScript interfaces
- `supabase/schema.sql` -> Source of truth for DB schema, RLS, and the `admin_login` RPC
- `public/` -> Static assets (`logo.svg` is a placeholder, replaceable)

Admin routes:
- `/admin` -> unified dashboard (recap + points + scan modal access via navbar)
- `/admin/recap`, `/admin/scan`, `/admin/points` -> redirect to `/admin` (kept for old bookmarks)

## 4. UI / Theme
- Dark theme with maroon/cream accent. Palette lives in `src/app/globals.css` (`:root` tokens in oklch).
- Reusable utility classes: `text-gradient`, `glow-maroon`, `glass-bar`.
- Logo placeholder at `public/logo.svg` (monogram "TE"); replaceable with real logo later.

## 5. Business Logic & Point System
- **Event Attendance (Scan QR):** +10 Points per event, once per member per day (`attendance-YYYY-MM-DD` activity, no duplicates).
- **Late penalty (auto):** `POST /api/admin/scan` compares server time (in `ABSENSI_TIMEZONE`, default `Asia/Jakarta`) with `ABSENSI_DEADLINE` (HH:mm). If the scan is after the deadline, attendance is still recorded but the attendance points row is UPDATEd from +10 to +5 and its activity becomes `attendance-YYYY-MM-DD-telat`; the response includes `isLate: true` so the scanner shows the amber "Hadir (Telat -5 Poin)" notification.
- Points are updated dynamically in the database and shown on `/leaderboard`.
- Manual adjustments stored in `adjustments` table; leaderboard sums `points` + `adjustments`.
- Admin roles: `Admin` and `Panitia`. Staff roles are everything else.
- Admins are invisible to normal members: RLS restricts anon selects on `members` to non-admin rows; admin login uses the `admin_login` RPC (security definer).
- Admin auth is a 2-step flow: lookup (members table or `admin_login` RPC), then PIN verification via `POST /api/admin-verify` (compares against `ADMIN_PIN` env var, server-side). `src/lib/role.ts` holds helpers: `isAdmin`, `isAdminVerified`, `setAdminVerified`, `clearAdminVerified`, `hasAdminAccess`.
- `adjustments` writes are only allowed server-side with the service role key via `POST /api/admin/adjust-points` (requires PIN + non-zero integer points + reason).

## 6. Environment Variables (`.env.local`, gitignored)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_PIN` (admin PIN; do not commit, do not print its value in code/summaries)
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `ABSENSI_DEADLINE` (HH:mm; scans after this time are marked late and lose 5 points)
- `ABSENSI_TIMEZONE` (timezone for the deadline/date calc; default `Asia/Jakarta`)

## 7. Agent Instructions & Rules
- Always write type-safe TypeScript code.
- Minimize external dependencies; stick to the specified tech stack.
- Do NOT use Pages Router (`pages/` directory). Use Next.js 13+ App Router (`src/app/`).
- Use clean and modern UI with responsive Tailwind design; respect the maroon/cream dark theme.
- Do NOT read `localStorage`/`Date.now()`/`new Date()` during render — that causes React hydration errors. Load them inside `useEffect` + state.
- RLS note: PostgREST returns HTTP 204 for a DELETE that matches 0 rows even when RLS blocks it. Verify RLS denials with an insert/select probe, not just the HTTP status.
- When deploying to Vercel, all six env vars above must be set in the Vercel dashboard (`.env.local` is NOT uploaded).
- After changing code, run `npx next lint`, `npx tsc --noEmit`, then `npm run build`.
