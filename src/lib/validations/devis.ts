import { z } from "zod";

/**
 * Schéma de la demande de devis envoyée depuis le configurateur.
 * Utilisé côté client (react-hook-form) ET côté serveur (route /api/devis)
 * pour ne valider les données qu'à un seul endroit.
 */
export const demandeDevisSchema = z.object({
  categorie: z.enum(["voiture", "sol", "mur", "bureau"]),
  produitId: z.string().uuid().optional(),
  configuration: z.object({
    taille: z.string().min(1, "Choisis une taille"),
    forme: z.string().min(1, "Choisis une forme"),
    couleur: z.array(z.string().min(1)).min(1, "Choisis au moins une couleur"),
  }),
  // Chemins dans le bucket Storage "devis-uploads" (pas des URLs publiques :
  // le bucket est privé, l'admin les consulte via une URL signée générée
  // à la demande — voir supabase/migrations/0005_storage.sql).
  fichiersUrls: z.array(z.string().min(1)).min(1, "Ajoute au moins une photo ou un design de référence").max(5, "5 fichiers maximum"),
  messageClient: z.string().min(1, "Décris ton projet").max(1000),
});

export type DemandeDevisInput = z.infer<typeof demandeDevisSchema>;

/**
 * Réponse du client à un devis reçu : n'autorise que deux valeurs, jamais
 * de changement de prix ou de statut arbitraire depuis le front.
 */
export const reponseDevisSchema = z.object({
  demandeId: z.string().uuid(),
  reponse: z.enum(["accepte", "refuse"]),
});
