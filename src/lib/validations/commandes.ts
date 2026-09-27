import { z } from "zod";

const STATUTS_COMMANDE = [
  "en_attente_paiement",
  "payee",
  "en_production",
  "expediee",
  "livree",
  "annulee",
] as const;

export const commandeUpdateSchema = z.object({
  statut: z.enum(STATUTS_COMMANDE).optional(),
  numeroSuivi: z.string().trim().max(120).optional(),
  transporteur: z.string().trim().max(120).optional(),
});
export type CommandeUpdateInput = z.infer<typeof commandeUpdateSchema>;
