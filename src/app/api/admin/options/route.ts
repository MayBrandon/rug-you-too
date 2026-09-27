import { NextResponse } from "next/server";
import { verifierAdmin } from "@/lib/admin/verifier-admin";
import { optionCreateSchema } from "@/lib/validations/catalogue";

/**
 * POST /api/admin/options
 * Ajoute une option de configuration (une taille, une forme, une couleur ou
 * une matière) pour une catégorie donnée.
 */
export async function POST(request: Request) {
  const check = await verifierAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const parsed = optionCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { categorie, type, label, valeur, supplementPrix, ordre } = parsed.data;

  const { data, error } = await check.supabase
    .from("options_configuration")
    .insert({
      categorie,
      type,
      label,
      valeur: valeur ?? "",
      supplement_prix: supplementPrix,
      ordre,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ option: data });
}
