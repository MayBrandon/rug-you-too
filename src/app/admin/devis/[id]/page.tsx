import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUTS_DEVIS_LABELS } from "@/lib/constants";
import { getOptionsCatalogue, getProduitBase, calculerPrixTuftage } from "@/lib/catalogue";
import type { CategorieTapis } from "@/types/database.types";
import { FixerDevisForm } from "@/components/admin/FixerDevisForm";
import { PrendreEnCharge } from "@/components/admin/PrendreEnCharge";

/**
 * Les demandes envoyées avant le passage aux couleurs multi-choix stockaient
 * `couleur` comme une simple chaîne — on les normalise en tableau pour rester
 * compatible avec les anciennes demandes en base.
 */
function couleursDeConfiguration(configuration: Record<string, string | string[]>): string[] {
  const valeur = configuration.couleur;
  if (Array.isArray(valeur)) return valeur;
  return valeur ? [valeur] : [];
}

export default async function AdminDevisDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: demande } = await supabase
    .from("demandes_devis")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!demande) notFound();

  const { data: client } = await supabase
    .from("profiles")
    .select("nom_complet, telephone")
    .eq("id", demande.client_id)
    .single();

  const categorie = demande.categorie as CategorieTapis;
  const configuration = (demande.configuration ?? {}) as Record<string, string | string[]>;
  const couleursChoisies = couleursDeConfiguration(configuration);

  // Le catalogue a pu changer depuis l'envoi de la demande : on inclut les
  // options désactivées pour retrouver le supplément d'un choix historique.
  const [produit, optionsCatalogue] = await Promise.all([
    getProduitBase(supabase, categorie),
    getOptionsCatalogue(supabase, categorie, { includeInactives: true }),
  ]);
  const prixSuggere = calculerPrixTuftage(produit?.prixBase ?? 0, optionsCatalogue, {
    taille: typeof configuration.taille === "string" ? configuration.taille : undefined,
    forme: typeof configuration.forme === "string" ? configuration.forme : undefined,
    couleurs: couleursChoisies,
  });

  // Fichiers privés : on génère des URLs signées à la volée (1h) plutôt que
  // de stocker des liens publics — voir supabase/migrations/0005_storage.sql,
  // la policy autorise un admin à lire les fichiers de n'importe quel client.
  const fichiersAvecUrl = await Promise.all(
    (demande.fichiers_urls ?? []).map(async (chemin) => {
      const { data } = await supabase.storage.from("devis-uploads").createSignedUrl(chemin, 3600);
      return { chemin, url: data?.signedUrl };
    })
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-[2px] text-accent-pink">
            Demande — {STATUTS_DEVIS_LABELS[demande.statut]}
          </span>
          <h1 className="font-display text-3xl">Tapis {categorie}</h1>
          <p className="text-sm text-ink-faint">
            {client?.nom_complet ?? "Client sans nom"}
            {client?.telephone ? ` — ${client.telephone}` : ""}
          </p>
        </div>
        {demande.statut === "nouvelle" && <PrendreEnCharge demandeId={demande.id} />}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <div className="border border-base-600 bg-base-800 p-6">
            <h2 className="mb-4 font-display text-xl">Configuration choisie</h2>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex justify-between border-b border-base-600 py-2">
                <span className="text-ink-faint">Taille</span>
                <span>{typeof configuration.taille === "string" ? configuration.taille : "—"}</span>
              </li>
              <li className="flex justify-between border-b border-base-600 py-2">
                <span className="text-ink-faint">Forme</span>
                <span>{typeof configuration.forme === "string" ? configuration.forme : "—"}</span>
              </li>
              <li className="flex justify-between gap-4 py-2 last:border-0">
                <span className="shrink-0 text-ink-faint">Couleurs</span>
                <span className="text-right">
                  {couleursChoisies.length > 0 ? couleursChoisies.join(", ") : "—"}
                </span>
              </li>
            </ul>
          </div>

          {demande.message_client && (
            <div className="border border-base-600 bg-base-800 p-6">
              <h2 className="mb-2 font-display text-xl">Message du client</h2>
              <p className="text-[15px] text-ink-muted">{demande.message_client}</p>
            </div>
          )}

          {fichiersAvecUrl.length > 0 && (
            <div className="border border-base-600 bg-base-800 p-6">
              <h2 className="mb-4 font-display text-xl">Fichiers joints</h2>
              <ul className="flex flex-col gap-2">
                {fichiersAvecUrl.map((f) => (
                  <li key={f.chemin}>
                    {f.url ? (
                      <a href={f.url} target="_blank" rel="noreferrer" className="text-accent-teal hover:underline">
                        {f.chemin.split("/").pop()}
                      </a>
                    ) : (
                      <span className="text-ink-faint">{f.chemin} (lien expiré)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {demande.note_admin && (
            <div className="border border-accent-gold/40 bg-base-800 p-6">
              <h2 className="mb-2 font-display text-xl text-accent-gold">Note interne</h2>
              <p className="text-[15px] text-ink-muted">{demande.note_admin}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="border border-base-600 bg-base-800 p-4 text-sm">
            <span className="text-ink-faint">Prix indicatif (config seule)</span>
            <div className="font-display text-2xl text-accent-gold">{prixSuggere} €</div>
            <p className="mt-1 text-xs text-ink-faint">
              Base calculée depuis les options choisies — à ajuster si personnalisation sur-mesure.
            </p>
          </div>

          {demande.statut !== "accepte" && demande.statut !== "refuse" && (
            <FixerDevisForm demandeId={demande.id} prixSuggere={demande.prix_propose ?? prixSuggere} />
          )}
        </div>
      </div>
    </div>
  );
}
