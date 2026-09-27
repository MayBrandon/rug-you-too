import { NextResponse } from "next/server";
import { verifierAdmin } from "@/lib/admin/verifier-admin";
import { optionUpdateSchema } from "@/lib/validations/catalogue";

/**
 * PATCH /api/admin/options/[id] — modifie label / valeur / supplément de prix
 * / actif / ordre. Utilisé aussi bien pour l'édition inline que pour le
 * bouton "Activer/Désactiver" (retire une option du configurateur sans la
 * supprimer, donc sans casser l'historique des demandes déjà envoyées).
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const check = await verifierAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const parsed = optionUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { label, valeur, supplementPrix, actif, ordre } = parsed.data;

  const { data, error } = await check.supabase
    .from("options_configuration")
    .update({
      ...(label !== undefined ? { label } : {}),
      ...(valeur !== undefined ? { valeur } : {}),
      ...(supplementPrix !== undefined ? { supplement_prix: supplementPrix } : {}),
      ...(actif !== undefined ? { actif } : {}),
      ...(ordre !== undefined ? { ordre } : {}),
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ option: data });
}

/**
 * DELETE /api/admin/options/[id] — suppression définitive d'une option.
 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const check = await verifierAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { error } = await check.supabase.from("options_configuration").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
