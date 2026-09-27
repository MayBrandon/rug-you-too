import { NextResponse } from "next/server";
import { verifierAdmin } from "@/lib/admin/verifier-admin";
import { commandeUpdateSchema } from "@/lib/validations/commandes";

/**
 * PATCH /api/admin/commandes/[id]
 * Modifie le statut et/ou les infos de suivi d'une commande (Brandon les
 * renseigne à la main une fois le colis expédié). Un champ vide efface la
 * valeur en base plutôt que de la laisser inchangée.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const check = await verifierAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const parsed = commandeUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { statut, numeroSuivi, transporteur } = parsed.data;

  const { data, error } = await check.supabase
    .from("commandes")
    .update({
      ...(statut !== undefined ? { statut } : {}),
      ...(numeroSuivi !== undefined ? { numero_suivi: numeroSuivi || null } : {}),
      ...(transporteur !== undefined ? { transporteur: transporteur || null } : {}),
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ commande: data });
}
