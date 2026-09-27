import { createClient } from "@/lib/supabase/server";
import { CatalogueManager } from "@/components/admin/catalogue/CatalogueManager";

// Toujours à jour : la page se relit à chaque visite, pas de cache statique
// sur un catalogue que l'admin modifie en direct.
export const dynamic = "force-dynamic";

export default async function AdminProduitsPage() {
  const supabase = createClient();

  // On récupère aussi les produits/options désactivés : Brandon doit pouvoir
  // les retrouver pour les réactiver, pas seulement en créer de nouveaux.
  const [{ data: produits }, { data: options }] = await Promise.all([
    supabase.from("produits").select("*").order("categorie").order("ordre"),
    supabase.from("options_configuration").select("*").order("categorie").order("type").order("ordre"),
  ]);

  const produitsClient = (produits ?? []).map((p) => ({
    id: p.id,
    categorie: p.categorie,
    nom: p.nom,
    prixBase: p.prix_base ?? 0,
    actif: p.actif,
    ordre: p.ordre,
  }));

  const optionsClient = (options ?? []).map((o) => ({
    id: o.id,
    categorie: o.categorie,
    type: o.type,
    label: o.label,
    valeur: o.valeur,
    supplementPrix: o.supplement_prix,
    actif: o.actif,
    ordre: o.ordre,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl">Catalogue</h1>
        <p className="text-sm text-ink-faint">
          Prix de départ et options du configurateur, par catégorie. Les changements sont visibles côté
          client immédiatement.
        </p>
      </div>

      <CatalogueManager produits={produitsClient} options={optionsClient} />
    </div>
  );
}
