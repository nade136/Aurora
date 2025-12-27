-- Add file_url column on students if missing
alter table if exists public.students
  add column if not exists file_url text;

-- Create a public storage bucket named 'certificates' if it doesn't exist
-- Prefer function when available
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'certificates'
  ) then
    -- For newer Postgres schema with helper
    begin
      perform storage.create_bucket('certificates', public := true);
    exception when others then
      -- Fallback for older schemas without create_bucket helper
      insert into storage.buckets (id, name, public)
      values ('certificates', 'certificates', true)
      on conflict (id) do nothing;
    end;
  end if;
end $$;

-- Ensure public read access to the bucket (defense in depth)
-- This policy allows anyone to read objects in the 'certificates' bucket
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read certificates'
  ) then
    create policy "Public read certificates"
      on storage.objects for select
      using (bucket_id = 'certificates');
  end if;
end $$;

-- Optional: restrict uploads/updates/deletes to service role only
-- Since our app writes via service key on API routes, we can explicitly enforce this.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Service role write certificates'
  ) then
    create policy "Service role write certificates"
      on storage.objects for all
      to service_role
      using (bucket_id = 'certificates')
      with check (bucket_id = 'certificates');
  end if;
end $$;
