-- ============================================================================
-- 0004_commandes.sql — Commande créée quand un devis est accepté et payé
-- ============================================================================

create type public.statut_commande as enum (
  'en_attente_paiement',
  'payee',
  'en_production',
  'expediee',
  'livree',
  'annulee'
);

create table public.commandes (
  id uuid primary key default gen_random_uuid(),
  demande_devis_id uuid not null unique references public.demandes_devis (id),
  client_id uuid not null references public.profiles (id),

  prix_final numeric(10, 2) not null,
  statut public.statut_commande not null default 'en_attente_paiement',

  stripe_payment_link_id text,
  stripe_payment_link_url text,
  stripe_checkout_session_id text,
  payee_le timestamptz,

  numero_suivi text,
  transporteur text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index commandes_client_id_idx on public.commandes (client_id);
create index commandes_statut_idx on public.commandes (statut);

alter table public.commandes enable row level security;

create policy "Un client voit ses propres commandes"
  on public.commandes for select
  using (auth.uid() = client_id or public.is_admin());

create policy "Seul le serveur (service_role) ou un admin créent une commande"
  on public.commandes for insert
  with check (public.is_admin());
  -- En pratique la création se fait surtout via la route API qui utilise
  -- le client admin (service_role, voir src/lib/supabase/admin.ts) après
  -- confirmation du paiement Stripe — cette policy couvre le cas où un
  -- admin la crée manuellement depuis le back-office.

create policy "Seuls les admins mettent à jour une commande"
  on public.commandes for update
  using (public.is_admin())
  with check (public.is_admin());

create trigger set_updated_at
  before update on public.commandes
  for each row execute procedure public.set_updated_at();
