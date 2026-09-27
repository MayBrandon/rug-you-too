-- ============================================================================
-- 0001_init.sql — Profils utilisateurs + rôles
-- ============================================================================

create type public.user_role as enum ('client', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'client',
  nom_complet text,
  telephone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Un profil est créé automatiquement à l'inscription (trigger sur auth.users).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nom_complet)
  values (new.id, new.raw_user_meta_data ->> 'nom_complet');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Un utilisateur voit son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Un utilisateur modifie son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Les admins voient tous les profils"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Petite fonction utilitaire réutilisée dans les policies des autres tables.
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Trigger générique pour maintenir updated_at, réutilisé par les tables suivantes.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
