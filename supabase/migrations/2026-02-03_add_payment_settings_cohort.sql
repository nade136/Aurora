alter table public.payment_settings
add column if not exists current_cohort text;
