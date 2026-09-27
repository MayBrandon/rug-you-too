import { createClient } from "@/lib/supabase/server";
import { STATUTS_DEVIS_LABELS } from "@/lib/constants";

export default async function AdminDashboard() {
  const supabase = createClient();

  const { data: demandes } = await supabase
    .from("demandes_devis")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Demandes de devis</h1>

      <div className="flex flex-col gap-2">
        {demandes?.map((d) => (
          <div key={d.id} className="flex items-center justify-between border border-base-600 bg-base-800 p-4">
            <div>
              <div className="font-semibold uppercase">{d.categorie}</div>
              <div className="text-sm text-ink-faint">{STATUTS_DEVIS_LABELS[d.statut]}</div>
            </div>
            {/* Lien vers /admin/devis/[id] pour étudier et fixer le prix */}
          </div>
        ))}
        {!demandes?.length && <p className="text-ink-faint">Aucune demande pour le moment.</p>}
      </div>
    </div>
  );
}
