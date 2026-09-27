import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUTS_DEVIS_LABELS } from "@/lib/constants";
import type { CategorieTapis } from "@/types/database.types";
import { ReponseDevis } from "@/components/devis/ReponseDevis";

export default async function SuiviDevisPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth/connexion?next=/devis/${params.id}`);

  const { data: demande } = await supabase
    .from("demandes_devis")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!demande) notFound();

  const categorie = demande.categorie as CategorieTapis;
  const configuration = (demande.configuration ?? {}) as Record<string, string | string[]>;
  const couleursChoisies = Array.isArray(configuration.couleur)
    ? configuration.couleur
    : configuration.couleur
      ? [configuration.couleur]
      : [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-8 py-16">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold uppercase tracking-[2px] text-accent-pink">
          Suivi de ta demande
        </span>
        <h1 className="font-display text-3xl">Tapis {categorie}</h1>
        <span className="w-fit -skew-x-[8deg] bg-base-700 px-3 py-1 text-sm font-semibold uppercase">
          <span className="block skew-x-[8deg]">{STATUTS_DEVIS_LABELS[demande.statut]}</span>
        </span>
      </div>

      <ul className="flex flex-col gap-2 border border-base-600 bg-base-800 p-6 text-sm">
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
          <span className="text-right">{couleursChoisies.length > 0 ? couleursChoisies.join(", ") : "—"}</span>
        </li>
      </ul>

      {demande.message_client && (
        <div className="border border-base-600 bg-base-800 p-4 text-sm text-ink-muted">
          <span className="mb-1 block font-semibold text-ink-light">Ton message</span>
          {demande.message_client}
        </div>
      )}

      {demande.statut === "devis_envoye" && demande.prix_propose && (
        <div className="flex flex-col gap-4 border-2 border-accent-gold bg-base-800 p-6">
          <div className="flex items-baseline justify-between">
            <span className="uppercase text-ink-faint">Devis proposé</span>
            <span className="font-display text-3xl text-accent-gold">{demande.prix_propose} €</span>
          </div>
          {demande.delai_estime_jours && (
            <p className="text-sm text-ink-muted">Délai estimé : {demande.delai_estime_jours} jours</p>
          )}
          <ReponseDevis demandeId={demande.id} />
        </div>
      )}

      {demande.statut === "nouvelle" || demande.statut === "en_etude" ? (
        <p className="text-sm text-ink-faint">
          Ta demande est bien reçue — Brandon te propose un prix sous peu, tu recevras une
          notification dès que le devis est prêt.
        </p>
      ) : null}
    </div>
  );
}
