import { NextResponse } from "next/server";
import { verifierAdmin } from "@/lib/admin/verifier-admin";
import { produitUpdateSchema } from "@/lib/validations/catalogue";

/**
 * PATCH /api/admin/produits/[id] — modifie nom / prix de base / actif / ordre.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const check = await verifierAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const parsed = produitUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { nom, prixBase, actif, ordre } = parsed.data;

  const { data, error } = await check.supabase
    .from("produits")
    .update({
      ...(nom !== undefined ? { nom } : {}),
      ...(prixBase !== undefined ? { prix_base: prixBase } : {}),
      ...(actif !== undefined ? { actif } : {}),
      ...(ordre !== undefined ? { ordre } : {}),
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ produit: data });
}

/**
 * DELETE /api/admin/produits/[id]
 * Suppression définitive — à utiliser surtout pour corriger une erreur de
 * saisie. Pour retirer un produit du configurateur sans perdre l'historique
 * des demandes déjà liées, préférer PATCH { actif: false }.
 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const check = await verifierAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { error } = await check.supabase.from("produits").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
