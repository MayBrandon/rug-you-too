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
 * Modèle de prix des tapis tuftés main, à partir des coûts réels de Brandon :
 *   - laine : une pelote de 100g coûte 2,50 €
 *   - cadre de référence : 90×90 cm (0,81 m²) construit pour 10 €
 *   - main d'œuvre : 25 €/h, ~6h pour tufter ce même cadre de référence,
 *     et ~7 pelotes utilisées dessus
 * On en déduit un coût par m², appliqué à la surface réellement choisie
 * dans le configurateur. Un tapis 2x plus grand ne coûte pas 2x plus cher
 * en pratique (le temps de préparation ne double pas), mais en l'absence
 * d'autres données ce modèle linéaire donne une estimation raisonnable —
 * le prix final reste de toute façon fixé à la main par Brandon lors du
 * devis (voir /admin/devis/[id]), ceci n'est qu'une estimation en direct
 * affichée au client pendant qu'il configure.
 */
const PRIX_LAINE_PAR_100G = 2.5; // €
const CADRE_REF_SURFACE_M2 = (90 * 90) / 10_000; // 0,81 m²
const CADRE_REF_PRIX = 10; // €
const PELOTES_REF = 7;
const HEURES_REF = 6;
const TAUX_HORAIRE = 25; // €/h

const PRIX_LAINE_PAR_M2 = (PELOTES_REF * PRIX_LAINE_PAR_100G) / CADRE_REF_SURFACE_M2;
const PRIX_CADRE_PAR_M2 = CADRE_REF_PRIX / CADRE_REF_SURFACE_M2;
const PRIX_MAIN_OEUVRE_PAR_M2 = (HEURES_REF * TAUX_HORAIRE) / CADRE_REF_SURFACE_M2;

/** ≈ 219 €/m² (laine + cadre + main d'œuvre) — voir le calcul ci-dessus. */
export const PRIX_TUFTAGE_PAR_M2 =
  Math.round((PRIX_LAINE_PAR_M2 + PRIX_CADRE_PAR_M2 + PRIX_MAIN_OEUVRE_PAR_M2) * 100) / 100;

/**
 * Cherche deux dimensions en cm dans un texte libre ("90x90", "120 x 80 cm",
 * "160×120"...) et renvoie la surface correspondante en m². `null` si le
 * texte ne contient pas de dimensions exploitables (ex: "2 tapis avant" pour
 * une taille de tapis voiture, qui ne se mesure pas en cm²).
 */
export function extraireSurfaceM2(texte: string): number | null {
  const match = texte.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/i);
  if (!match) return null;

  const largeur = parseFloat(match[1]!.replace(",", "."));
  const hauteur = parseFloat(match[2]!.replace(",", "."));
  if (!largeur || !hauteur) return null;

  return (largeur * hauteur) / 10_000;
}

export interface SelectionTuftage {
  taille?: string;
  forme?: string;
  couleurs?: string[];
}

/**
 * Le formulaire du configurateur stocke le LABEL choisi (pas un id) dans
 * `demandes_devis.configuration` — un choix pris à un instant T reste lisible
 * même si l'option est renommée ou retirée du catalogue plus tard.
 *
 * Si la taille choisie porte des dimensions exploitables (label ou valeur du
 * type "90x90"), le prix est calculé au m² (voir PRIX_TUFTAGE_PAR_M2) plus
 * les suppléments de forme/couleur. Sinon (ex: tailles de tapis voiture,
 * type "jeu complet"), on retombe sur le modèle additif simple : prix de
 * base + suppléments.
 */
export function calculerPrixTuftage(
  prixBase: number,
  options: Record<TypeOption, OptionCatalogue[]>,
  selection: SelectionTuftage
): number {
  const tailleOption = selection.taille
    ? options.taille.find((o) => o.label === selection.taille)
    : undefined;
  const formeOption = selection.forme
    ? options.forme.find((o) => o.label === selection.forme)
    : undefined;
  const couleurOptions = (selection.couleurs ?? [])
    .map((label) => options.couleur.find((o) => o.label === label))
    .filter((o): o is OptionCatalogue => Boolean(o));

  const supplementForme = formeOption?.supplementPrix ?? 0;
  const supplementCouleurs = couleurOptions.reduce((total, o) => total + o.supplementPrix, 0);

  const surfaceM2 = tailleOption
    ? extraireSurfaceM2(tailleOption.label) ?? extraireSurfaceM2(tailleOption.valeur)
    : null;

  const total = surfaceM2
    ? surfaceM2 * PRIX_TUFTAGE_PAR_M2 + supplementForme + supplementCouleurs
    : prixBase + (tailleOption?.supplementPrix ?? 0) + supplementForme + supplementCouleurs;

  return Math.round(total * 100) / 100;
}
