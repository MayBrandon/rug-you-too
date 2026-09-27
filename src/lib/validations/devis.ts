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
    couleur: z.string().min(1, "Choisis une couleur"),
    matiere: z.string().min(1, "Choisis une matière"),
  }),
  fichiersUrls: z.array(z.string().url()).max(5, "5 fichiers maximum").default([]),
  messageClient: z.string().max(1000).optional(),
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
