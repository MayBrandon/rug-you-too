import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STATUTS_DEVIS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const COULEUR_STATUT: Record<string, string> = {
  nouvelle: "border-accent-pink",
  en_etude: "border-accent-gold",
  devis_envoye: "border-accent-teal",
  accepte: "border-accent-violet",
  refuse: "border-base-600",
  expire: "border-base-600",
};

export default async function AdminDemandesPage() {
  const supabase = createClient();

  const { data: demandes } = await supabase
    .from("demandes_devis")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Demandes de devis</h1>

      <div className="flex flex-col gap-2">
        {demandes?.map((d) => (
          <Link
            key={d.id}
            href={`/admin/devis/${d.id}`}
            className={`flex items-center justify-between border-l-4 bg-base-800 p-4 hover:bg-base-700 ${COULEUR_STATUT[d.statut] ?? "border-base-600"}`}
          >
            <div>
              <div className="font-semibold uppercase">{d.categorie}</div>
              <div className="text-sm text-ink-faint">
                {new Date(d.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {d.prix_propose && <span className="text-accent-gold">{d.prix_propose} €</span>}
              <span className="text-sm text-ink-faint">{STATUTS_DEVIS_LABELS[d.statut]}</span>
            </div>
          </Link>
        ))}
        {!demandes?.length && <p className="text-ink-faint">Aucune demande pour le moment.</p>}
      </div>
    </div>
  );
}
