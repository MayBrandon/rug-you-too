import { z } from "zod";

export const profilUpdateSchema = z.object({
  nomComplet: z.string().trim().min(1).max(120).optional(),
  telephone: z.string().trim().max(30).optional(),
});
export type ProfilUpdateInput = z.infer<typeof profilUpdateSchema>;
