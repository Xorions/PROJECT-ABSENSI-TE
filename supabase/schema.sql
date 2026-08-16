-- =============================================================
-- Staff of The Month - Supabase Schema
-- Jalankan di Supabase SQL Editor (satu kali)
-- =============================================================

-- 1. Buat Tabel Members
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,       -- No.ID (misal: TE-23016)
    name VARCHAR(100) NOT NULL,       -- Nama Lengkap (Username Login)
    division VARCHAR(100),            -- Bidang
    position VARCHAR(100),            -- Jabatan
    nim VARCHAR(50),                  -- NIM
    study_program VARCHAR(100),       -- Program Studi
    role VARCHAR(20) DEFAULT 'member',-- 'member' atau 'member'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert Data Pengurus INTI, Departemen, & Staf
-- (termasuk 2 akun admin khusus untuk scanner panitia)
INSERT INTO members (id, name, division, position, nim, study_program, role) VALUES
('AD-10101', 'Admin Panitia 1', 'PANITIA', 'Scanner Admin 1', '00000000', 'Tera Esports', 'Admin'),
('AD-20202', 'Admin Panitia 2', 'PANITIA', 'Scanner Admin 2', '00000000', 'Tera Esports', 'Admin'),
-- INTI
('TE-23016', 'Raja Putra Desriyan', 'INTI', 'Ketua Umum', '123370080', 'Teknik Pertambangan', 'member'),
('TE-24032', 'Alma Alia Zahra', 'INTI', 'Sekretaris Jendral', '123260071', 'Farmasi', 'member'),
('TE-24057', 'Aryo Fajar Pratomo', 'INTI', 'Sekretaris Umum', '124140012', 'Teknik Informatika', 'member'),
('TE-25078', 'Muhammad Auraqiel Yusandra Syahprapto', 'INTI', 'Sekretaris I', '124500047', 'Rekayasa Kosmetik', 'member'),
('TE-24038', 'Agrafi Rade', 'INTI', 'Bendahara Umum', '124240057', 'Arsitektur', 'member'),
('TE-24049', 'Annisa Fitria', 'INTI', 'Bendahara I', '124390042', 'Arsitektur Lanskap', 'member'),

-- GAME & KEATLETAN
('TE-24068', 'Farid Rizky Fauzan', 'GAME & KEATLETAN', 'Kepala Departemen Game dan Keatletan', '124140210', 'Teknik Informatika', 'member'),
('TE-24053', 'Muhammad Hawari', 'GAME & KEATLETAN', 'Kepala Divisi RND', '124280027', 'Teknik Kimia', 'member'),
('TE-24069', 'Dhafin Atharsyah M', 'GAME & KEATLETAN', 'Kepala Divisi Manager', '124370007', 'Teknik Pertambangan', 'member'),
('TE-24077', 'Muhammad Azriel Patra', 'GAME & KEATLETAN', 'Kepala Divisi Event', '12440069', 'Teknik Telekomunikasi', 'member'),

-- INTERNAL
('TE-24075', 'Salsabila', 'INTERNAL', 'Kepala Departemen Internal', '123260057', 'Farmasi', 'member'),
('TE-24076', 'Ashilah Tsabitah Fitr', 'INTERNAL', 'Kepala Divisi Harmonia', '123260076', 'Farmasi', 'member'),
('TE-24043', 'Nizar Safariansyah', 'INTERNAL', 'Kepala Divisi General Affair', '124400029', 'Teknik Telekomunikasi', 'member'),

-- EKSTERNAL
('TE-24066', 'Rizki Anugra Ramadani', 'EKSTERNAL', 'Kepala Departemen Eksternal', '124460036', 'Teknik Perkeretaapian', 'member'),
('TE-24064', 'Yerikho Febryan Pane', 'EKSTERNAL', 'Kepala Divisi Business Development', '124400034', 'Teknik Telekomunikasi', 'member'),
('TE-24041', 'Bima Ekayasa', 'EKSTERNAL', 'Kepala Divisi Public Relationship', '124450106', 'Sains Data', 'member'),
('TE-24042', 'Fariz Ferdinan', 'EKSTERNAL', 'Kepala Divisi Community Engangement', '124420118', 'Rekayasa Kehutanan', 'member'),

-- MEDIA KREATIF
('TE-24058', 'Devian Amry Kadafi', 'MEDIA KREATIF', 'Kepala Departemen Media Kreatif', '124420030', 'Rekayasa Kehutanan', 'member'),
('TE-24054', 'Sena Permatasari', 'MEDIA KREATIF', 'Kepala Divisi Digital Media', '124140018', 'Teknik Informatika', 'member'),
('TE-24061', 'Kezia Adelina Tamba', 'MEDIA KREATIF', 'Kepala Divisi Kreatif', '124140046', 'Teknik Informatika', 'member'),
('TE-24044', 'Naysa Syafillah Lovenia', 'MEDIA KREATIF', 'Kepala Divisi Talent', '124260061', 'Farmasi', 'member'),
('TE-24036', 'Aidil Fallah', 'MEDIA KREATIF', 'Kepala Divisi Broadcast Ops', '123120099', 'Teknik Geofisika', 'member'),

-- HUMAN RESOURCE
('TE-24037', 'Rakha Daffa Tama Truski', 'HUMAN RESOURCE', 'Kepala Departemen Human Resource', '124140196', 'Teknik Informatika', 'member'),
('TE-24060', 'Ariel Raditya Andiansyah', 'HUMAN RESOURCE', 'Kepala Divisi Consept Squad', '124210038', 'Teknik Sipil', 'member'),
('TE-24071', 'Kelvin Sugiwangsih', 'HUMAN RESOURCE', 'Kepala Divisi Action Squad', '124370155', 'Teknik Pertambangan', 'member'),

-- STAFF (GAME DAN KEATLETAN)
('TE-25082', 'Muhammad Abdan Syakura', 'GAME DAN KEATLETAN', 'Staff Divisi RND', '125400063', 'Teknik Telekomunikasi', 'member'),
('TE-25088', 'Aghna Athayaa Mahdi', 'GAME DAN KEATLETAN', 'Staff Divisi RND', '125430131', 'Teknik Biomedis', 'member'),
('TE-25081', 'M Bagus Pamungkas', 'GAME DAN KEATLETAN', 'Staff Divisi Manager', '125300048', 'Teknik Kelautan', 'member'),
('TE-25099', 'Jefri', 'GAME DAN KEATLETAN', 'Staff Divisi Manager', '123130124', 'Teknik Elektro', 'member'),
('TE-25084', 'Alan Jhumadhi Rizki', 'GAME DAN KEATLETAN', 'Staff Divisi Event', '125370204', 'Teknik Pertambangan', 'member'),
('TE-25087', 'Adjeng Nurtirta Sheilarasati', 'GAME DAN KEATLETAN', 'Staff Divisi Event', '125370199', 'Teknik Pertambangan', 'member'),
('TE-25093', 'Ery Surya Pratama', 'GAME DAN KEATLETAN', 'Staff Divisi Event', '125440015', 'Sains Lingkungan Kelautan', 'member'),

-- STAFF (INTERNAL)
('TE-25100', 'Tobagus Ahmad Yogi', 'INTERNAL', 'Staff Divisi Harmonia', '124400075', 'Teknik Telekomunikasi', 'member'),
('TE-25105', 'Adinda Aura Safitri', 'INTERNAL', 'Staff Divisi Harmonia', '123260072', 'Farmasi', 'member'),
('TE-25091', 'Alfan Aulia Syah Ardeti', 'INTERNAL', 'Staff Divisi Harmonia', '125480068', 'Rekayasa Minyak dan Gas', 'member'),
('TE-25104', 'Riki Fauji', 'INTERNAL', 'Staff Divisi General Affair', '123130069', 'Teknik Elektro', 'member'),
('TE-25083', 'Sajid Rahman Hakim', 'INTERNAL', 'Staff Divisi General Affair', '125170012', 'Teknik Mesin', 'member'),

-- STAFF (EKSTERNAL)
('TE-24040', 'Dwiki Arya Novandra', 'EKSTERNAL', 'Staff Divisi Business Development', '124190061', 'Teknik Industri', 'member'),
('TE-24040-2', 'Rayhan Sevtiano Widjaya', 'EKSTERNAL', 'Staff Divisi Business Development', '124400018', 'Teknik Telekomunikasi', 'member'),
('TE-25086', 'Valentino Martin', 'EKSTERNAL', 'Staff Divisi Public Relationship', '125320021', 'Teknik Fisika', 'member'),
('TE-25098', 'M. Zalifunnas', 'EKSTERNAL', 'Staff Divisi Public Relationship', '125260166', 'Farmasi', 'member'),
('TE-25094', 'Robby Yacob Panjaitan', 'EKSTERNAL', 'Staff Divisi Community Engangement', '125120042', 'Teknik Geofisika', 'member'),

-- STAFF (MEDIA KREATIF)
('TE-25080', 'Chevvy Al Falah Harahap', 'MEDIA KREATIF', 'Staff Divisi Digital Media', '125140082', 'Teknik Informatika', 'member'),
('TE-25090', 'Aldika Pradita Oktora', 'MEDIA KREATIF', 'Staff Divisi Digital Media', '125320046', 'Teknik Fisika', 'member'),
('TE-25101', 'Zahrah auliya m', 'MEDIA KREATIF', 'Staff Divisi Kreatif', '124380083', 'DKV', 'member'),
('TE-25092', 'Dimas Indo Pradana', 'MEDIA KREATIF', 'Staff Divisi Kreatif', '123380052', 'DKV', 'member'),
('TE-25096', 'Anindya Ratri Alvita', 'MEDIA KREATIF', 'Staff Divisi Talent', '122260013', 'Farmasi', 'member'),
('TE-25106', 'Lady Mutiara Indah', 'MEDIA KREATIF', 'Staff Divisi Talent', '125460083', 'Teknik Perkeretaapian', 'member'),
('TE-25107', 'Ratu Aditiya Dwi Puspita', 'MEDIA KREATIF', 'Staff Divisi Talent', '125320012', 'Teknik Fisika', 'member'),
('TE-25108', 'Olda Eyunike Siahaan', 'MEDIA KREATIF', 'Staff Divisi Broadcast Ops', '125160034', 'Matematika', 'member'),
('TE-25085', 'Naw Faldi Pirza', 'MEDIA KREATIF', 'Staff Divisi Broadcast Ops', '125320040', 'Teknik Fisika', 'member'),
('TE-25103', 'Gian Fallos Alzarezzy', 'MEDIA KREATIF', 'Staff Divisi Broadcast Ops', '124230096', 'Teknik Geomatika', 'member'),

-- STAFF (HUMAN RESOURCE)
('TE-25079', 'Mirza Nabila Arfa', 'HUMAN RESOURCE', 'Staff Divisi Consept Squad', '125490008', 'Rekayasa Instrumentasi dan Automasi', 'member'),
('TE-25095', 'Rekson Apriten Damanik', 'HUMAN RESOURCE', 'Staff Divisi Consept Squad', '125260053', 'Farmasi', 'member'),
('TE-25102', 'HANIF Abid Al Rizky', 'HUMAN RESOURCE', 'Staff Divisi Consept Squad', '125130114', 'Teknik Elektro', 'member'),
('TE-25089', 'Alya Zahrani Amri', 'HUMAN RESOURCE', 'Staff Divisi Consept Squad', '125260193', 'Farmasi', 'member'),
('TE-25097', 'Ar Rahman Muttaqin', 'HUMAN RESOURCE', 'Staff Divisi Action Squad', '125420100', 'Rekayasa Kehutanan', 'member'),
('TE-24074', 'Rafi Ahmad B', 'HUMAN RESOURCE', 'Staff Divisi Action Squad', '124340072', 'Teknik Sistem Energi', 'member'),
('TE-24052', 'Haqqi Ourieck Putera', 'HUMAN RESOURCE', 'Staff Divisi Action Squad', '124480086', 'Rekayasa Minyak dan Gas', 'member')
ON CONFLICT (id) DO NOTHING;

-- ---------- 3. TABEL ATTENDANCE (absensi) ----------
create table if not exists public.attendance (
  id         uuid primary key default gen_random_uuid(),
  member_id  text not null references public.members(id) on delete cascade,
  date       date not null,
  status     text not null default 'hadir' check (status in ('hadir', 'izin', 'alpa')),
  created_at timestamptz default now(),
  unique (member_id, date, status)        -- cegah absen dobel per hari
);

-- ---------- 4. TABEL POINTS (poin kegiatan) ----------
create table if not exists public.points (
  id         uuid primary key default gen_random_uuid(),
  member_id  text not null references public.members(id) on delete cascade,
  activity   text not null,               -- 'attendance-YYYY-MM-DD'
  points     integer not null check (points > 0),
  created_at timestamptz default now(),
  unique (member_id, activity)            -- cegah poin dobel per aktivitas
);

-- ---------- 5. ROW LEVEL SECURITY ----------
alter table public.members    enable row level security;
alter table public.attendance enable row level security;
alter table public.points     enable row level security;

-- Anggota: anon hanya bisa baca member NON-admin (admin jadi invisible)
drop policy if exists "anon select members" on public.members;
create policy "anon select members" on public.members
  for select using (role not in ('Admin', 'Panitia', 'panitia'));

drop policy if exists "anon select attendance" on public.attendance;
create policy "anon select attendance" on public.attendance for select using (true);
drop policy if exists "anon insert attendance" on public.attendance;
create policy "anon insert attendance" on public.attendance for insert with check (true);
drop policy if exists "anon select points" on public.points;
create policy "anon select points"     on public.points     for select using (true);
drop policy if exists "anon insert points" on public.points;
create policy "anon insert points"     on public.points     for insert with check (true);
drop policy if exists "anon delete points" on public.points;

-- ---------- 6. LOGIN ADMIN RAHASIA ----------
-- Hanya mengembalikan baris admin jika nama + ID persis cocok.
-- Keamanan: dijalankan sebagai pemilik tabel (bypass RLS), jadi
-- data admin tidak pernah bisa di-SELECT langsung oleh publik.
create or replace function public.admin_login(p_name text, p_id text)
returns public.members
language sql
security definer
set search_path = public
as $$
  select m.*
  from public.members m
  where m.name ilike p_name
    and m.id = p_id
    and m.role in ('Admin', 'Panitia', 'panitia')
  limit 1;
$$;

revoke all on function public.admin_login(text, text) from public;
grant execute on function public.admin_login(text, text) to anon;

-- ---------- 7. TABEL ADJUSTMENTS (penyesuaian poin manual) ----------
-- Disimpan di tabel terpisah agar poin absensi (+10) dan penyesuaian
-- manual (+/-) tidak saling bentrok (unique member_id+activity).
-- Hanya service_role yang boleh menulis (server), publik cuma baca.
create table if not exists public.adjustments (
  id         uuid primary key default gen_random_uuid(),
  member_id  text not null references public.members(id) on delete cascade,
  points     integer not null check (points <> 0),
  reason     text,
  created_at timestamptz default now()
);

alter table public.adjustments enable row level security;
drop policy if exists "anon select adjustments" on public.adjustments;
create policy "anon select adjustments" on public.adjustments for select using (true);