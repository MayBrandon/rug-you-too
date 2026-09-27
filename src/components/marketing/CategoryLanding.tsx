import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";
import { getProduitBase, getOptionsCatalogue, PRIX_TUFTAGE_PAR_M2 } from "@/lib/catalogue";
import { Button } from "@/components/ui/Button";
import type { CategorieTapis, TypeOption } from "@/types/database.types";

const TYPES: { type: TypeOption; label: string }[] = [
  { type: "taille", label: "Taille" },
  { type: "forme", label: "Forme" },
  { type: "couleur", label: "Couleur" },
];

/**
 * Page de présentation d'une catégorie (voiture/sol/mur/bureau). Les options
 * affichées (extraits de tailles/formes/couleurs/matières) viennent du
 * catalogue en base — voir src/lib/catalogue.ts — pour rester cohérentes
 * avec ce que Brandon configure depuis /admin/produits.
 */
export async function CategoryLanding({ categorie }: { categorie: CategorieTapis }) {
  const meta = CATEGORIES.find((c) => c.slug === categorie)!;
  const supabase = createClient();

  const [produit, options] = await Promise.all([
    getProduitBase(supabase, categorie),
    getOptionsCatalogue(supabase, categorie),
  ]);

  return (
    <div className="flex flex-col">
      <section className="flex flex-col gap-6 border-b-[6px] border-accent-pink bg-gradient-to-br from-base-900 via-[#2A123C] to-[#3C1240] px-8 py-20 md:px-16">
        <span className="w-fit -skew-x-[8deg] bg-accent-gold px-4 py-2 text-sm font-bold uppercase tracking-wide text-base-950">
          <span className="block skew-x-[8deg]">Tapis {meta.label.toLowerCase()} — tufté à la main, sur mesure</span>
        </span>
        <h1 className="font-display text-5xl">{meta.label}</h1>
        <p className="max-w-[560px] text-lg leading-relaxed text-ink-muted">{meta.description}</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button href={`/configurateur/${categorie}`} variant="pink">
            Configurer mon tapis
          </Button>
          {produit && (
            <span className="text-sm text-ink-faint">
              À partir de <span className="text-accent-gold">{produit.prixBase} €</span> — soit environ{" "}
              {PRIX_TUFTAGE_PAR_M2} €/m² tufté main
            </span>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 px-8 py-16 sm:grid-cols-2 md:px-16 lg:grid-cols-3">
        {TYPES.map(({ type, label }) => (
          <div key={type} className="flex flex-col gap-3 border-t-4 border-accent-teal bg-base-800 p-5">
            <h3 className="font-display text-lg">{label}</h3>
            <ul className="flex flex-col gap-1 text-sm text-ink-muted">
              {options[type].slice(0, 4).map((o) => (
                <li key={o.id}>{o.label}</li>
              ))}
              {options[type].length === 0 && <li className="text-ink-faint">Bientôt disponible</li>}
            </ul>
          </div>
        ))}
      </section>

      <section className="flex flex-col items-center gap-6 border-t border-base-600 bg-base-800 px-8 py-16 text-center md:px-16">
        <h2 className="font-display text-3xl">Prêt à configurer le tien ?</h2>
        <p className="max-w-[520px] text-ink-muted">
          Choisis ta taille, ta forme et tes couleurs, ajoute une photo de référence — reçois un devis
          gratuit avant toute fabrication.
        </p>
        <Button href={`/configurateur/${categorie}`} variant="teal">
          Configurer mon tapis {meta.label.toLowerCase()}
        </Button>
      </section>
    </div>
  );
}
