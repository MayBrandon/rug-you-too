import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STATUTS_DEVIS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    { count: nouvelles },
    { count: enEtude },
    { count: devisEnvoyes },
    { count: commandesPayees },
    { data: demandesRecentes },
  ] = await Promise.all([
    supabase.from("demandes_devis").select("*", { count: "exact", head: true }).eq("statut", "nouvelle"),
    supabase.from("demandes_devis").select("*", { count: "exact", head: true }).eq("statut", "en_etude"),
    supabase.from("demandes_devis").select("*", { count: "exact", head: true }).eq("statut", "devis_envoye"),
    supabase.from("commandes").select("*", { count: "exact", head: true }).neq("statut", "en_attente_paiement"),
    supabase.from("demandes_devis").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  const stats = [
    { label: "Nouvelles demandes", value: nouvelles ?? 0, href: "/admin/demandes", accent: "border-accent-pink" },
    { label: "En étude", value: enEtude ?? 0, href: "/admin/demandes", accent: "border-accent-gold" },
    {
      label: "Devis en attente de réponse",
      value: devisEnvoyes ?? 0,
      href: "/admin/demandes",
      accent: "border-accent-teal",
    },
    { label: "Commandes payées", value: commandesPayees ?? 0, href: "/admin/commandes", accent: "border-accent-violet" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl">Tableau de bord</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`flex flex-col gap-2 border-t-4 bg-base-800 p-5 hover:bg-base-700 ${s.accent}`}
          >
            <span className="font-display text-4xl">{s.value}</span>
            <span className="text-sm uppercase text-ink-faint">{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Activité récente</h2>
          <Link href="/admin/demandes" className="text-sm text-accent-teal hover:underline">
            Voir toutes les demandes
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {demandesRecentes?.map((d) => (
            <Link
              key={d.id}
              href={`/admin/devis/${d.id}`}
              className="flex items-center justify-between border-l-4 border-base-600 bg-base-800 p-4 hover:bg-base-700"
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
              <span className="text-sm text-ink-faint">{STATUTS_DEVIS_LABELS[d.statut]}</span>
            </Link>
          ))}
          {!demandesRecentes?.length && <p className="text-ink-faint">Aucune activité pour le moment.</p>}
        </div>
      </div>
    </div>
  );
}
