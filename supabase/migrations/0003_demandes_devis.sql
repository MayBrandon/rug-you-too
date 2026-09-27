-- ============================================================================
-- 0003_demandes_devis.sql — Cœur du parcours : demande -> devis -> validation
-- ============================================================================

create type public.statut_devis as enum (
  'nouvelle',        -- client vient d'envoyer sa demande
  'en_etude',        -- Brandon l'a prise en charge
  'devis_envoye',    -- prix + délai proposés au client
  'accepte',         -- client a accepté -> une commande est créée
  'refuse',          -- client a refusé
  'expire'           -- pas de réponse dans le délai
);

create table public.demandes_devis (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  categorie public.categorie_tapis not null,
  produit_id uuid references public.produits (id),

  -- Choix du configurateur, stockés en JSON pour rester flexibles
  -- (ex: { "taille": "180x120", "forme": "rectangle", "couleur": "Terracotta", "matiere": "Velours" })
  configuration jsonb not null default '{}'::jsonb,

  -- Personnalisation sur-mesure (logo/motif/photo envoyés par le client)
  fichiers_urls text[] not null default '{}',
  message_client text,

  statut public.statut_devis not null default 'nouvelle',
  prix_propose numeric(10, 2),
  delai_estime_jours integer,
  note_admin text, -- usage interne, jamais exposé au client

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index demandes_devis_client_id_idx on public.demandes_devis (client_id);
create index demandes_devis_statut_idx on public.demandes_devis (statut);

alter table public.demandes_devis enable row level security;

create policy "Un client voit ses propres demandes"
  on public.demandes_devis for select
  using (auth.uid() = client_id or public.is_admin());

create policy "Un client crée ses propres demandes"
  on public.demandes_devis for insert
  with check (auth.uid() = client_id);

create policy "Un client accepte/refuse son devis, un admin gère tout"
  on public.demandes_devis for update
  using (auth.uid() = client_id or public.is_admin())
  with check (auth.uid() = client_id or public.is_admin());
  -- NB: la restriction "un client ne peut modifier que le champ statut,
  -- et seulement vers accepte/refuse, et seulement si statut = devis_envoye"
  -- se fait via une fonction dédiée (RPC) plutôt qu'en RLS pure — voir
  -- 0006 (à venir) : public.repondre_au_devis(demande_id, reponse).

create trigger set_updated_at
  before update on public.demandes_devis
  for each row execute procedure public.set_updated_at();
