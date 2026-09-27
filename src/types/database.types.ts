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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          nom_complet: string | null;
          telephone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      produits: {
        Row: {
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
        };
        Insert: Partial<Database["public"]["Tables"]["produits"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["produits"]["Row"]>;
      };
      options_configuration: {
        Row: {
          id: string;
          categorie: CategorieTapis;
          type: TypeOption;
          label: string;
          valeur: string;
          supplement_prix: number;
          actif: boolean;
          ordre: number;
        };
        Insert: Partial<Database["public"]["Tables"]["options_configuration"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["options_configuration"]["Row"]>;
      };
      demandes_devis: {
        Row: {
          id: string;
          client_id: string;
          categorie: CategorieTapis;
          produit_id: string | null;
          configuration: Record<string, string>;
          fichiers_urls: string[];
          message_client: string | null;
          statut: StatutDevis;
          prix_propose: number | null;
          delai_estime_jours: number | null;
          note_admin: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["demandes_devis"]["Row"]> & {
          client_id: string;
          categorie: CategorieTapis;
        };
        Update: Partial<Database["public"]["Tables"]["demandes_devis"]["Row"]>;
      };
      commandes: {
        Row: {
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
        };
        Insert: Partial<Database["public"]["Tables"]["commandes"]["Row"]> & {
          demande_devis_id: string;
          client_id: string;
          prix_final: number;
        };
        Update: Partial<Database["public"]["Tables"]["commandes"]["Row"]>;
      };
    };
  };
}
