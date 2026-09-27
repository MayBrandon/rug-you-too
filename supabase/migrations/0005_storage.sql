-- ============================================================================
-- 0005_storage.sql — Bucket pour les fichiers de personnalisation (logo/photo)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('devis-uploads', 'devis-uploads', false)
on conflict (id) do nothing;

-- Convention de chemin : devis-uploads/{client_id}/{demande_id}/{fichier}
-- Un client ne peut lire/écrire que dans son propre dossier ; les admins voient tout.

create policy "Un client upload dans son propre dossier"
  on storage.objects for insert
  with check (
    bucket_id = 'devis-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Un client lit ses propres fichiers, un admin lit tout"
  on storage.objects for select
  using (
    bucket_id = 'devis-uploads'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "Un client supprime ses propres fichiers, un admin tout"
  on storage.objects for delete
  using (
    bucket_id = 'devis-uploads'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
