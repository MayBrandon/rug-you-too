import { createClient } from "@/lib/supabase/server";
import { CommandeRow } from "@/components/admin/commandes/CommandeRow";
import type { CategorieTapis } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function AdminCommandesPage() {
  const supabase = createClient();

  const { data: commandes } = await supabase
    .from("commandes")
    .select("*")
    .order("created_at", { ascending: false });

  const clientIds = [...new Set((commandes ?? []).map((c) => c.client_id))];
  const demandeIds = [...new Set((commandes ?? []).map((c) => c.demande_devis_id))];

  let profiles: { id: string; nom_complet: string | null; telephone: string | null }[] = [];
  if (clientIds.length > 0) {
    const { data } = await supabase.from("profiles").select("id, nom_complet, telephone").in("id", clientIds);
    profiles = data ?? [];
  }

  let demandes: { id: string; categorie: CategorieTapis }[] = [];
  if (demandeIds.length > 0) {
    const { data } = await supabase.from("demandes_devis").select("id, categorie").in("id", demandeIds);
    demandes = data ?? [];
  }

  const profilById = new Map(profiles.map((p) => [p.id, p]));
  const categorieByDemandeId = new Map(demandes.map((d) => [d.id, d.categorie]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Commandes</h1>

      <div className="flex flex-col gap-3">
        {(commandes ?? []).map((commande) => (
          <CommandeRow
            key={commande.id}
            commande={{
              id: commande.id,
              demandeDevisId: commande.demande_devis_id,
              categorie: categorieByDemandeId.get(commande.demande_devis_id) ?? null,
              clientNom: profilById.get(commande.client_id)?.nom_complet ?? null,
              clientTelephone: profilById.get(commande.client_id)?.telephone ?? null,
              prixFinal: commande.prix_final,
              statut: commande.statut,
              numeroSuivi: commande.numero_suivi,
              transporteur: commande.transporteur,
              createdAt: commande.created_at,
            }}
          />
        ))}
        {!commandes?.length && <p className="text-ink-faint">Aucune commande pour le moment.</p>}
      </div>
    </div>
  );
}
