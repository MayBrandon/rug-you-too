import { z } from "zod";

/**
 * Schémas de validation pour /admin/produits — la page qui permet à Brandon
 * de gérer le catalogue (prix de base par catégorie + options taille/forme/
 * couleur/matière) sans toucher au code. Distincts des schémas client :
 * ces routes ne sont accessibles qu'aux admins (voir vérifierAdmin() dans
 * chaque route.ts).
 */

const CATEGORIES_TAPIS = ["voiture", "sol", "mur", "bureau"] as const;
const TYPES_OPTION = ["taille", "forme", "couleur", "matiere"] as const;

export const produitCreateSchema = z.object({
  categorie: z.enum(CATEGORIES_TAPIS),
  nom: z.string().trim().min(1, "Le nom est requis").max(120),
  prixBase: z.coerce.number().nonnegative("Le prix ne peut pas être négatif"),
  ordre: z.coerce.number().int().optional().default(0),
});
export type ProduitCreateInput = z.infer<typeof produitCreateSchema>;

export const produitUpdateSchema = z.object({
  nom: z.string().trim().min(1).max(120).optional(),
  prixBase: z.coerce.number().nonnegative().optional(),
  actif: z.boolean().optional(),
  ordre: z.coerce.number().int().optional(),
});
export type ProduitUpdateInput = z.infer<typeof produitUpdateSchema>;

export const optionCreateSchema = z.object({
  categorie: z.enum(CATEGORIES_TAPIS),
  type: z.enum(TYPES_OPTION),
  label: z.string().trim().min(1, "Le label est requis").max(120),
  valeur: z.string().trim().max(50).optional().default(""),
  supplementPrix: z.coerce.number().default(0),
  ordre: z.coerce.number().int().optional().default(0),
});
export type OptionCreateInput = z.infer<typeof optionCreateSchema>;

export const optionUpdateSchema = z.object({
  label: z.string().trim().min(1).max(120).optional(),
  valeur: z.string().trim().max(50).optional(),
  supplementPrix: z.coerce.number().optional(),
  actif: z.boolean().optional(),
  ordre: z.coerce.number().int().optional(),
});
export type OptionUpdateInput = z.infer<typeof optionUpdateSchema>;
