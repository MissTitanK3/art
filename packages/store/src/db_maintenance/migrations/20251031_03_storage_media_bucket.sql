-- Ensure the public 'media' storage bucket exists and has sane policies
-- This supports browser uploads (authenticated users) and public read via public URLs.

-- Create bucket if missing
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Basic policies for the 'media' bucket
-- Allow anyone to read objects via storage API if bucket is public (public URL access does not consult RLS),
-- but keep SELECT here permissive for tooling where needed.
drop policy if exists media_select_any on storage.objects;
create policy media_select_any on storage.objects
for select
to public
using (bucket_id = 'media');

-- Allow authenticated users to insert into 'media'
drop policy if exists media_insert_authenticated on storage.objects;
create policy media_insert_authenticated on storage.objects
for insert
to authenticated
with check (bucket_id = 'media');

-- Allow owners to update/delete their own objects in 'media'
drop policy if exists media_update_owner on storage.objects;
create policy media_update_owner on storage.objects
for update
to authenticated
using (bucket_id = 'media' and owner = auth.uid())
with check (bucket_id = 'media' and owner = auth.uid());

drop policy if exists media_delete_owner on storage.objects;
create policy media_delete_owner on storage.objects
for delete
to authenticated
using (bucket_id = 'media' and owner = auth.uid());

