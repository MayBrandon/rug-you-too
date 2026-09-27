-- ============================================================================
-- 0002_produits.sql — Catalogue : univers, options de configuration
-- ============================================================================

create type public.categorie_tapis as enum ('voiture', 'sol', 'mur', 'bureau');

create table public.produits (
  id uuid primary key default gen_random_uuid(),
  categorie public.categorie_tapis not null,
  nom text not null,
  slug text not null unique,
  description text,
  image_url text,
  prix_base numeric(10, 2), -- prix indicatif affiché ; le prix réel est fixé au devis
  actif boolean not null default true,
  ordre integer not null default 0,
  created_at timestamptz not null default now()
);

-- Options de configuration disponibles par catégorie (taille, forme, couleur, matière).
-- Modélisées en table plutôt qu'en enum figé : Brandon doit pouvoir ajouter une
-- matière ou une couleur depuis l'admin sans migration.
create type public.type_option as enum ('taille', 'forme', 'couleur', 'matiere');

create table public.options_configuration (
  id uuid primary key default gen_random_uuid(),
  categorie public.categorie_tapis not null,
  type public.type_option not null,
  label text not null,
  valeur text not null, -- ex: code hex pour une couleur, dimensions pour une taille
  supplement_prix numeric(10, 2) not null default 0,
  actif boolean not null default true,
  ordre integer not null default 0
);

alter table public.produits enable row level security;
alter table public.options_configuration enable row level security;

create policy "Le catalogue actif est public en lecture"
  on public.produits for select
  using (actif = true or public.is_admin());

create policy "Les options actives sont publiques en lecture"
  on public.options_configuration for select
  using (actif = true or public.is_admin());

create policy "Seuls les admins gèrent le catalogue"
  on public.produits for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Seuls les admins gèrent les options"
  on public.options_configuration for all
  using (public.is_admin())
  with check (public.is_admin());
