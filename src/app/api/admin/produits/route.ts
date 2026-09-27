import { NextResponse } from "next/server";
import { verifierAdmin } from "@/lib/admin/verifier-admin";
import { produitCreateSchema } from "@/lib/validations/catalogue";

function slugify(texte: string) {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * POST /api/admin/produits
 * Crée un nouveau "produit" de base pour une catégorie (nom + prix de départ
 * affiché dans le configurateur — voir src/lib/catalogue.ts). Le slug est
 * généré automatiquement : il ne sert qu'en interne (contrainte unique de la
 * table), Brandon n'a jamais besoin de le voir ni de le choisir.
 */
export async function POST(request: Request) {
  const check = await verifierAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const parsed = produitCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { categorie, nom, prixBase, ordre } = parsed.data;
  const slug = `${categorie}-${slugify(nom) || "produit"}-${Date.now().toString(36)}`;

  const { data, error } = await check.supabase
    .from("produits")
    .insert({ categorie, nom, slug, prix_base: prixBase, ordre })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ produit: data });
}
