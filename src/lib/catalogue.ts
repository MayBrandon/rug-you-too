import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, CategorieTapis, TypeOption } from "@/types/database.types";

/**
 * Le catalogue (prix de base + options taille/forme/couleur/matière) vit en
 * base — table `produits` pour le prix de départ par catégorie, table
 * `options_configuration` pour les choix du configurateur — plutôt qu'en dur
 * dans le code, pour que Brandon puisse l'éditer depuis /admin/produits sans
 * toucher au code. Ce fichier centralise la lecture de ces deux tables et le
 * calcul de prix, utilisé à la fois par le configurateur (aperçu en direct)
 * et par l'admin (prix indicatif suggéré sur une demande).
 */

export interface OptionCatalogue {
  id: string;
  type: TypeOption;
  label: string;
  valeur: string; // pour "couleur" : un code hex ; sinon informatif
  supplementPrix: number;
  actif: boolean;
  ordre: number;
}

export interface ProduitBase {
  id: string;
  nom: string;
  prixBase: number;
}

const TYPES_OPTION: TypeOption[] = ["taille", "forme", "couleur", "matiere"];

export async function getProduitBase(
  supabase: SupabaseClient<Database>,
  categorie: CategorieTapis
): Promise<ProduitBase | null> {
  const { data } = await supabase
    .from("produits")
    .select("id, nom, prix_base")
    .eq("categorie", categorie)
    .eq("actif", true)
    .order("ordre", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return { id: data.id, nom: data.nom, prixBase: data.prix_base ?? 0 };
}

export async function getOptionsCatalogue(
  supabase: SupabaseClient<Database>,
  categorie: CategorieTapis,
  { includeInactives = false }: { includeInactives?: boolean } = {}
): Promise<Record<TypeOption, OptionCatalogue[]>> {
  let query = supabase
    .from("options_configuration")
    .select("*")
    .eq("categorie", categorie)
    .order("ordre", { ascending: true });

  if (!includeInactives) query = query.eq("actif", true);

  const { data } = await query;

  const parNature: Record<TypeOption, OptionCatalogue[]> = {
    taille: [],
    forme: [],
    couleur: [],
    matiere: [],
  };

  for (const row of data ?? []) {
    parNature[row.type as TypeOption].push({
      id: row.id,
      type: row.type as TypeOption,
      label: row.label,
      valeur: row.valeur,
      supplementPrix: row.supplement_prix,
      actif: row.actif,
      ordre: row.ordre,
    });
  }

  return parNature;
}

/**
 * Le formulaire du configurateur stocke le LABEL choisi (pas un id) dans
 * `demandes_devis.configuration` — un choix pris à un instant T reste lisible
 * même si l'option est renommée ou retirée du catalogue plus tard. Le calcul
 * de prix retrouve le supplément correspondant par label.
 */
export function calculerPrixCatalogue(
  prixBase: number,
  options: Record<TypeOption, OptionCatalogue[]>,
  selection: Partial<Record<TypeOption, string>>
): number {
  let total = prixBase;

  for (const type of TYPES_OPTION) {
    const labelChoisi = selection[type];
    if (!labelChoisi) continue;
    const option = options[type].find((o) => o.label === labelChoisi);
    if (option) total += option.supplementPrix;
  }

  return total;
}
