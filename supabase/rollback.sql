-- =====================================================================
-- POWER EXPRESS — CMS security ROLLBACK
-- Run this in the Supabase SQL Editor ONLY if something stopped working
-- after admin-setup.sql. It restores the exact previous behavior
-- (row security off — the database becomes openly writable again, as it
-- was before).
-- =====================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'activity',
    'activity-tag',
    'activity-type',
    'benefit',
    'contact',
    'hero-banner',
    'localization',
    'media',
    'partner',
    'project'
  ]
  loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('drop policy if exists "cms insert" on public.%I', t);
    execute format('drop policy if exists "cms update" on public.%I', t);
    execute format('drop policy if exists "cms delete" on public.%I', t);
    execute format('alter table public.%I disable row level security', t);
  end loop;
end $$;

-- Storage policies added by admin-setup.sql (safe to keep, but removed
-- here for a complete rollback). Public reading of the bucket continues
-- to work because the bucket itself is public.
drop policy if exists "cms upload pex" on storage.objects;
drop policy if exists "cms update pex" on storage.objects;
drop policy if exists "cms delete pex" on storage.objects;
drop policy if exists "public read pex" on storage.objects;
