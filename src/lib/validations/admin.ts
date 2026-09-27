import { z } from "zod";

/**
 * Ce que Brandon renseigne depuis /admin/devis/[id] pour transformer une
 * demande en devis chiffré. Distinct du schéma client (lib/validations/devis.ts) :
 * ces champs ne doivent jamais pouvoir être fixés par le client lui-même.
 */
export const fixerDevisSchema = z.object({
  prixPropose: z.coerce.number().positive("Le prix doit être positif"),
  delaiEstimeJours: z.coerce.number().int().positive().optional(),
  noteAdmin: z.string().max(2000).optional(),
});

export type FixerDevisInput = z.infer<typeof fixerDevisSchema>;
