import type { CategorieTapis } from "@/types/database.types";

export const CATEGORIES: { slug: CategorieTapis; label: string; description: string }[] = [
  { slug: "voiture", label: "Voiture", description: "Coupe exacte pour ton modèle, finitions premium." },
  { slug: "sol", label: "Sol", description: "Formats, formes et matières libres pour ton intérieur." },
  { slug: "mur", label: "Mur", description: "Pièce déco murale avec ton motif, logo ou photo." },
  { slug: "bureau", label: "Bureau", description: "Tapis de bureau ou sous-chaise aux couleurs de ta marque." },
];

export const STATUTS_DEVIS_LABELS: Record<string, string> = {
  nouvelle: "Nouvelle demande",
  en_etude: "En étude",
  devis_envoye: "Devis envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
  expire: "Expiré",
};

export const STATUTS_COMMANDE_LABELS: Record<string, string> = {
  en_attente_paiement: "En attente de paiement",
  payee: "Payée",
  en_production: "En production",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

export const SITE_NAME = "Rug You Too";
