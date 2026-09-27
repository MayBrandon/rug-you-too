import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { Configurateur } from "@/components/configurateur/Configurateur";
import { createClient } from "@/lib/supabase/server";
import { getProduitBase, getOptionsCatalogue } from "@/lib/catalogue";
import type { CategorieTapis } from "@/types/database.types";

// Le catalogue vient de la base et Brandon peut le modifier depuis /admin/produits
// à tout moment : pas de mise en cache statique, on relit à chaque visite.
export const dynamic = "force-dynamic";

export default async function ConfigurateurPage({ params }: { params: { categorie: string } }) {
  const categorie = CATEGORIES.find((c) => c.slug === params.categorie);
  if (!categorie) notFound();

  const supabase = createClient();
  const categorieSlug = categorie.slug as CategorieTapis;

  const [produit, options] = await Promise.all([
    getProduitBase(supabase, categorieSlug),
    getOptionsCatalogue(supabase, categorieSlug),
  ]);

  const auMoinsUneOption = Object.values(options).some((liste) => liste.length > 0);

  if (!produit || !auMoinsUneOption) {
    return (
      <div className="mx-auto max-w-xl px-8 py-20 text-center">
        <h1 className="font-display text-2xl">Catalogue en cours de préparation</h1>
        <p className="mt-3 text-ink-muted">
          Cette catégorie n&apos;a pas encore d&apos;options configurées. Reviens un peu plus tard.
        </p>
      </div>
    );
  }

  return (
    <Configurateur
      categorie={categorieSlug}
      categorieLabel={categorie.label}
      prixBase={produit.prixBase}
      options={options}
    />
  );
}
