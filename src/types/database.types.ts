/**
 * Placeholder — à régénérer dès que le projet Supabase de Rug You Too existe :
 *
 *   npx supabase gen types typescript --project-id <project-ref> --schema public \
 *     > src/types/database.types.ts
 *
 * (ou `npm run supabase:types` avec SUPABASE_PROJECT_ID dans l'environnement)
 *
 * En attendant, ce fichier définit à la main la forme des tables créées par
 * les migrations dans supabase/migrations/, pour que le reste du code
 * (src/lib/supabase/*, composants) type-check correctement dès maintenant.
 */

export type UserRole = "client" | "admin";
export type CategorieTapis = "voiture" | "sol" | "mur" | "bureau";
export type TypeOption = "taille" | "forme" | "couleur" | "matiere";
export type StatutDevis =
  | "nouvelle"
  | "en_etude"
  | "devis_envoye"
  | "accepte"
  | "refuse"
  | "expire";
export type StatutCommande =
  | "en_attente_paiement"
  | "payee"
  | "en_production"
  | "expediee"
  | "livree"
  | "annulee";

// --- Chaque table est définie à plat (pas d'auto-référence via Database[...])
// pour que l'inférence générique de @supabase/postgrest-js reste simple. ---

type ProfileRow = {
  id: string;
  role: UserRole;
  nom_complet: string | null;
  telephone: string | null;
  created_at: string;
  updated_at: string;
}

type ProduitRow = {
  id: string;
  categorie: CategorieTapis;
  nom: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  prix_base: number | null;
  actif: boolean;
  ordre: number;
  created_at: string;
}

type OptionConfigurationRow = {
  id: string;
  categorie: CategorieTapis;
  type: TypeOption;
  label: string;
  valeur: string;
  supplement_prix: number;
  actif: boolean;
  ordre: number;
}

type DemandeDevisRow = {
  id: string;
  client_id: string;
  categorie: CategorieTapis;
  produit_id: string | null;
  configuration: Record<string, string | string[]>;
  fichiers_urls: string[];
  message_client: string | null;
  statut: StatutDevis;
  prix_propose: number | null;
  delai_estime_jours: number | null;
  note_admin: string | null;
  created_at: string;
  updated_at: string;
}

type CommandeRow = {
  id: string;
  demande_devis_id: string;
  client_id: string;
  prix_final: number;
  statut: StatutCommande;
  stripe_payment_link_id: string | null;
  stripe_payment_link_url: string | null;
  stripe_checkout_session_id: string | null;
  payee_le: string | null;
  numero_suivi: string | null;
  transporteur: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      produits: {
        Row: ProduitRow;
        Insert: Partial<ProduitRow>;
        Update: Partial<ProduitRow>;
        Relationships: [];
      };
      options_configuration: {
        Row: OptionConfigurationRow;
        Insert: Partial<OptionConfigurationRow>;
        Update: Partial<OptionConfigurationRow>;
        Relationships: [];
      };
      demandes_devis: {
        Row: DemandeDevisRow;
        Insert: Partial<DemandeDevisRow> & Pick<DemandeDevisRow, "client_id" | "categorie">;
        Update: Partial<DemandeDevisRow>;
        Relationships: [];
      };
      commandes: {
        Row: CommandeRow;
        Insert: Partial<CommandeRow> &
          Pick<CommandeRow, "demande_devis_id" | "client_id" | "prix_final">;
        Update: Partial<CommandeRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      categorie_tapis: CategorieTapis;
      type_option: TypeOption;
      statut_devis: StatutDevis;
      statut_commande: StatutCommande;
    };
    CompositeTypes: Record<string, never>;
  };
}
