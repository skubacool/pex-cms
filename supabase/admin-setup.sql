-- =====================================================================
-- POWER EXPRESS — CMS security setup
-- Run this ONCE in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/yttnuerixoafmhpdghdm/sql/new
--
-- What it does:
--   1) Locks every content table:
--        - public (the website + anyone with the publishable key) = READ ONLY
--        - signed-in CMS users = full edit rights (insert/update/delete)
--   2) Lets signed-in CMS users upload images to the public "pex" bucket.
--
-- What it does NOT do:
--   - It does NOT change or delete any data.
--   - The Table Editor in this dashboard keeps working exactly as before
--     (the dashboard bypasses these policies).
--   - The live website keeps working: it only READS, and public read
--     stays allowed.
--
-- If anything looks wrong afterwards, run rollback.sql to restore the
-- previous behavior exactly.
--
-- AFTER RUNNING THIS, DO THESE TWO STEPS IN THE DASHBOARD — REQUIRED:
--   A) Authentication -> Sign In / Up ->
--        DISABLE "Allow new users to sign up"
--      (otherwise strangers could register and edit your site)
--   B) Authentication -> Users -> Add user ->
--        team member's email + a strong password, tick "Auto Confirm User"
--      Repeat for each person who should edit content via the CMS.
-- =====================================================================

-- 1) Content tables: public read-only, authenticated full access.
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
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "public read" on public.%I', t);
    execute format(
      'create policy "public read" on public.%I for select to anon, authenticated using (true)',
      t
    );

    execute format('drop policy if exists "cms insert" on public.%I', t);
    execute format(
      'create policy "cms insert" on public.%I for insert to authenticated with check (true)',
      t
    );

    execute format('drop policy if exists "cms update" on public.%I', t);
    execute format(
      'create policy "cms update" on public.%I for update to authenticated using (true) with check (true)',
      t
    );

    execute format('drop policy if exists "cms delete" on public.%I', t);
    execute format(
      'create policy "cms delete" on public.%I for delete to authenticated using (true)',
      t
    );
  end loop;
end $$;

-- 2) Storage: signed-in CMS users may upload/replace images in "pex".
--    (The bucket is already public for reading; that stays the same.)
drop policy if exists "cms upload pex" on storage.objects;
create policy "cms upload pex" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pex');

drop policy if exists "cms update pex" on storage.objects;
create policy "cms update pex" on storage.objects
  for update to authenticated
  using (bucket_id = 'pex');

drop policy if exists "cms delete pex" on storage.objects;
create policy "cms delete pex" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pex');

drop policy if exists "public read pex" on storage.objects;
create policy "public read pex" on storage.objects
  for select to public
  using (bucket_id = 'pex');
