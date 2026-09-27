"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import type { CategorieTapis, TypeOption } from "@/types/database.types";
import { ProduitsPanel, type ProduitRowClient } from "./ProduitsPanel";
import { OptionsPanel, type OptionRowClient } from "./OptionsPanel";

interface CatalogueManagerProps {
  produits: ProduitRowClient[];
  options: OptionRowClient[];
}

const TYPES: { type: TypeOption; label: string }[] = [
  { type: "taille", label: "Tailles" },
  { type: "forme", label: "Formes" },
  { type: "couleur", label: "Couleurs" },
  { type: "matiere", label: "Matières" },
];

/**
 * Onglets par catégorie (voiture/sol/mur/bureau) — chacun affiche le(s)
 * produit(s) de base et les 4 groupes d'options du configurateur. Toute
 * modification passe par /api/admin/produits ou /api/admin/options, qui
 * vérifient le rôle admin côté serveur avant d'écrire.
 */
export function CatalogueManager({ produits, options }: CatalogueManagerProps) {
  const [categorie, setCategorie] = useState<CategorieTapis>("voiture");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setCategorie(c.slug)}
            className={`-skew-x-[8deg] px-5 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
              categorie === c.slug
                ? "bg-accent-pink text-base-950"
                : "bg-base-800 text-ink-faint hover:text-ink-light"
            }`}
          >
            <span className="block skew-x-[8deg]">{c.label}</span>
          </button>
        ))}
      </div>

      <ProduitsPanel categorie={categorie} produits={produits.filter((p) => p.categorie === categorie)} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {TYPES.map(({ type, label }) => (
          <OptionsPanel
            key={type}
            categorie={categorie}
            type={type}
            label={label}
            options={options.filter((o) => o.categorie === categorie && o.type === type)}
          />
        ))}
      </div>
    </div>
  );
}
