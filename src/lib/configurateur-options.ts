import type { CategorieTapis, TypeOption } from "@/types/database.types";

/**
 * Options du configurateur, en dur pour l'instant (structure calquée sur la
 * table `options_configuration` — voir supabase/migrations/0002_produits.sql).
 * À remplacer par un fetch Supabase une fois le catalogue admin en place :
 * la forme des données (value/label/supplementPrix) reste la même, seule
 * l'origine change (voir `getOptions` plus bas, déjà écrit pour ça).
 */

export interface ConfigOption {
  value: string;
  label: string;
  supplementPrix: number;
  swatch?: string; // couleur hex, pour les options de type "couleur"
}

export const PRIX_BASE_PAR_CATEGORIE: Record<CategorieTapis, number> = {
  voiture: 89,
  sol: 129,
  mur: 149,
  bureau: 69,
};

type OptionsParCategorie = Record<CategorieTapis, Record<TypeOption, ConfigOption[]>>;

const TAILLES_VOITURE: ConfigOption[] = [
  { value: "avant", label: "2 tapis avant", supplementPrix: 0 },
  { value: "complet", label: "Jeu complet (4 tapis)", supplementPrix: 35 },
  { value: "coffre", label: "+ tapis de coffre", supplementPrix: 25 },
];

const TAILLES_SOL: ConfigOption[] = [
  { value: "120x80", label: "120 x 80 cm", supplementPrix: 0 },
  { value: "160x120", label: "160 x 120 cm", supplementPrix: 30 },
  { value: "200x140", label: "200 x 140 cm", supplementPrix: 60 },
  { value: "sur-mesure", label: "Dimensions sur mesure", supplementPrix: 40 },
];

const TAILLES_MUR: ConfigOption[] = [
  { value: "60x90", label: "60 x 90 cm", supplementPrix: 0 },
  { value: "90x140", label: "90 x 140 cm", supplementPrix: 40 },
  { value: "sur-mesure", label: "Dimensions sur mesure", supplementPrix: 50 },
];

const TAILLES_BUREAU: ConfigOption[] = [
  { value: "70x100", label: "70 x 100 cm", supplementPrix: 0 },
  { value: "sous-chaise", label: "Sous-chaise (100 x 130 cm)", supplementPrix: 20 },
];

const FORMES_STANDARD: ConfigOption[] = [
  { value: "rectangle", label: "Rectangle", supplementPrix: 0 },
  { value: "rond", label: "Rond", supplementPrix: 15 },
  { value: "sur-mesure", label: "Découpe sur mesure", supplementPrix: 30 },
];

const COULEURS: ConfigOption[] = [
  { value: "noir", label: "Noir", supplementPrix: 0, swatch: "#151316" },
  { value: "terracotta", label: "Terracotta", supplementPrix: 0, swatch: "#C1583B" },
  { value: "gris", label: "Gris chiné", supplementPrix: 0, swatch: "#8A8478" },
  { value: "rose", label: "Rose fuchsia", supplementPrix: 5, swatch: "#FF3D9A" },
  { value: "turquoise", label: "Turquoise", supplementPrix: 5, swatch: "#2DE0C4" },
  { value: "personnalisee", label: "Couleur personnalisée", supplementPrix: 10, swatch: "#7A3DFF" },
];

const MATIERES_VOITURE: ConfigOption[] = [
  { value: "moquette", label: "Moquette renforcée", supplementPrix: 0 },
  { value: "caoutchouc", label: "Caoutchouc (résistant eau/boue)", supplementPrix: 15 },
  { value: "velours", label: "Velours premium", supplementPrix: 25 },
];

const MATIERES_TEXTILE: ConfigOption[] = [
  { value: "velours", label: "Velours", supplementPrix: 0 },
  { value: "berbere", label: "Berbère", supplementPrix: 10 },
  { value: "exterieur", label: "Fibre extérieur (résistante UV/pluie)", supplementPrix: 20 },
];

export const OPTIONS: OptionsParCategorie = {
  voiture: { taille: TAILLES_VOITURE, forme: FORMES_STANDARD, couleur: COULEURS, matiere: MATIERES_VOITURE },
  sol: { taille: TAILLES_SOL, forme: FORMES_STANDARD, couleur: COULEURS, matiere: MATIERES_TEXTILE },
  mur: { taille: TAILLES_MUR, forme: FORMES_STANDARD, couleur: COULEURS, matiere: MATIERES_TEXTILE },
  bureau: { taille: TAILLES_BUREAU, forme: FORMES_STANDARD, couleur: COULEURS, matiere: MATIERES_TEXTILE },
};

export const ETAPES: { type: TypeOption; label: string }[] = [
  { type: "taille", label: "Taille" },
  { type: "forme", label: "Forme" },
  { type: "couleur", label: "Couleur" },
  { type: "matiere", label: "Matière" },
];

export function getOptions(categorie: CategorieTapis, type: TypeOption): ConfigOption[] {
  return OPTIONS[categorie][type];
}

export function calculerPrix(
  categorie: CategorieTapis,
  selection: Partial<Record<TypeOption, string>>
): number {
  let total = PRIX_BASE_PAR_CATEGORIE[categorie];

  for (const etape of ETAPES) {
    const valeurChoisie = selection[etape.type];
    if (!valeurChoisie) continue;
    const option = getOptions(categorie, etape.type).find((o) => o.value === valeurChoisie);
    if (option) total += option.supplementPrix;
  }

  return total;
}
