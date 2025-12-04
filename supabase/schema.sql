-- Run this in Supabase SQL editor
-- 1) Enable UUID extension (if not already)
create extension if not exists "uuid-ossp";

-- 2) Profiles: map auth users to roles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','editor')) default 'editor',
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- 3) Pages
create table if not exists public.pages (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  status text not null check (status in ('draft','published')) default 'draft',
  updated_at timestamp with time zone default now(),
  updated_by uuid references auth.users(id)
);

alter table public.pages enable row level security;

-- 4) Sections
create table if not exists public.sections (
  id uuid primary key default uuid_generate_v4(),
  page_id uuid not null references public.pages(id) on delete cascade,
  key text not null,
  "order" integer not null default 0
);

alter table public.sections enable row level security;

-- 5) Blocks
create table if not exists public.blocks (
  id uuid primary key default uuid_generate_v4(),
  section_id uuid not null references public.sections(id) on delete cascade,
  type text not null,
  data jsonb not null default '{}',
  "order" integer not null default 0
);

alter table public.blocks enable row level security;

-- 6) Media assets registry (path stored in storage)
create table if not exists public.media_assets (
  id uuid primary key default uuid_generate_v4(),
  storage_path text not null,
  alt text,
  width integer,
  height integer,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

alter table public.media_assets enable row level security;

-- Helper: is_admin() using profiles
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p where p.user_id = uid and p.role = 'admin'
  );
$$;

-- RLS Policies
-- Anonymous: read only published content
create policy if not exists "anon can read published pages" on public.pages
for select using (status = 'published');

create policy if not exists "anon can read sections of published pages" on public.sections
for select using (
  exists (select 1 from public.pages pg where pg.id = sections.page_id and pg.status = 'published')
);

create policy if not exists "anon can read blocks of published pages" on public.blocks
for select using (
  exists (
    select 1 from public.sections s join public.pages pg on pg.id = s.page_id
    where s.id = blocks.section_id and pg.status = 'published'
  )
);

-- Editors/Admins: read everything when authenticated
create policy if not exists "auth can read all" on public.pages
for select to authenticated using (true);
create policy if not exists "auth can read all sections" on public.sections
for select to authenticated using (true);
create policy if not exists "auth can read all blocks" on public.blocks
for select to authenticated using (true);
create policy if not exists "auth can read media" on public.media_assets
for select to authenticated using (true);

-- Editors/Admins: write content
create policy if not exists "editor/admin can insert pages" on public.pages
for insert to authenticated with check (true);
create policy if not exists "editor/admin can update pages" on public.pages
for update to authenticated using (true) with check (true);
create policy if not exists "editor/admin can delete pages" on public.pages
for delete to authenticated using (public.is_admin(auth.uid()));

create policy if not exists "editor/admin write sections" on public.sections
for all to authenticated using (true) with check (true);

create policy if not exists "editor/admin write blocks" on public.blocks
for all to authenticated using (true) with check (true);

create policy if not exists "editor/admin write media" on public.media_assets
for all to authenticated using (true) with check (true);

-- Profiles RLS
create policy if not exists "user can read own profile" on public.profiles
for select to authenticated using (user_id = auth.uid());
create policy if not exists "admin can manage profiles" on public.profiles
for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Seed the pages registry (optional)
insert into public.pages (slug, title, status)
values
  ('home','Home','draft'),
  ('services','Services','draft'),
  ('reviews','Reviews','draft'),
  ('rewards','Rewards','draft'),
  ('faq','FAQ','draft')
on conflict (slug) do nothing;

-- 7) Storage: Ensure a public 'media' bucket exists and policies allow uploads/listing
-- Create bucket (no-op if it already exists; run safely in SQL editor)
select
  case
    when exists (select 1 from storage.buckets where id = 'media') then null
    else storage.create_bucket('media', public => true)
  end;

-- Policies for media bucket
-- Public read access (so the website can load images)
create policy if not exists "public read media objects" on storage.objects
for select
to public
using (bucket_id = 'media');

-- Authenticated users can upload new files
create policy if not exists "authenticated can upload media" on storage.objects
for insert
to authenticated
with check (bucket_id = 'media');

-- Authenticated users can update files (optional; keep simple for CMS)
create policy if not exists "authenticated can update media" on storage.objects
for update
to authenticated
using (bucket_id = 'media')
with check (bucket_id = 'media');

-- Authenticated users can delete files (optional)
create policy if not exists "authenticated can delete media" on storage.objects
for delete
to authenticated
using (bucket_id = 'media');
