-- ============================================================================
-- Storage: um bucket único para uploads (partitura, áudio-guia, figurino,
-- material de aula). Convenção de path: {group_id}/{qualquer-coisa}, para
-- que a policy consiga checar a associação ao grupo pelo primeiro segmento.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('group-files', 'group-files', true)
on conflict (id) do nothing;

-- Leitura pública (arquivos servidos por URL direta, como já previsto no
-- brief para PDFs/áudios embutidos) — mas upload/gestão restrita a membros e
-- admins do grupo dono do path.
create policy "group_files_public_read" on storage.objects for select
  using (bucket_id = 'group-files');

create policy "group_files_admin_insert" on storage.objects for insert
  with check (
    bucket_id = 'group-files'
    and is_group_admin((storage.foldername(name))[1]::uuid)
  );

create policy "group_files_admin_update" on storage.objects for update
  using (
    bucket_id = 'group-files'
    and is_group_admin((storage.foldername(name))[1]::uuid)
  );

create policy "group_files_admin_delete" on storage.objects for delete
  using (
    bucket_id = 'group-files'
    and is_group_admin((storage.foldername(name))[1]::uuid)
  );
