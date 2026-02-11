create extension if not exists "pgcrypto";
-- Registrations: store student registration details (created after successful payment later)
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  cohort text,
  first_name text,
  last_name text,
  email text,
  institution text,
  current_position text,
  role_category text,
  social_url text
);

-- Payments: link to registrations and store payment metadata
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  registration_id uuid references public.registrations(id) on delete set null,
  amount numeric,
  currency text,
  provider text default 'paystack',
  reference text,
  status text,
  paid_at timestamp with time zone,
  raw jsonb
);

-- Payment settings: admin-configurable amount and currency used for new payments
create table if not exists public.payment_settings (
  id uuid primary key default gen_random_uuid(),
  updated_at timestamp with time zone default now(),
  amount numeric,
  currency text
);

-- Ensure one row exists (optional seed)
insert into public.payment_settings (amount, currency)
select 50000, 'NGN'
where not exists (select 1 from public.payment_settings);

-- Email templates: reusable templates for admin sends
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  name text unique not null,
  subject text not null,
  body_html text not null
);

-- Seed default registration success template if missing
insert into public.email_templates (name, subject, body_html)
select 'registration_success', 'Registration Successful', '<p>Thank you for registering. We will contact you via email soon.</p>'
where not exists (select 1 from public.email_templates where name = 'registration_success');

-- Email logs: track emails sent from admin
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  registration_id uuid references public.registrations(id) on delete set null,
  email text not null,
  subject text not null,
  body_html text not null,
  attachments text[] default '{}',
  status text not null,
  provider_message_id text,
  error text
);

-- Ensure payments can be upserted by reference
create unique index if not exists payments_reference_unique on public.payments(reference);

-- Option A: disable RLS for admin-facing tables
alter table public.registrations disable row level security;
alter table public.payments disable row level security;
alter table public.payment_settings disable row level security;
alter table public.email_templates disable row level security;
alter table public.email_logs disable row level security;