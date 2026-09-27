import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STATUTS_DEVIS_LABELS } from "@/lib/constants";
import { ProfilForm } from "@/components/compte/ProfilForm";

// Le layout parent (src/app/compte/layout.tsx) garantit déjà qu'un
// utilisateur est connecté ; on relit à chaque visite pour voir ses demandes
// à jour (statut, prix proposé) sans cache statique.
export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: demandes }] = await Promise.all([
    supabase.from("profiles").select("nom_complet, telephone").eq("id", user.id).single(),
    supabase
      .from("demandes_devis")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold uppercase tracking-[2px] text-accent-pink">Mon compte</span>
        <h1 className="font-display text-3xl">{profile?.nom_complet || "Bienvenue"}</h1>
        <p className="text-sm text-ink-faint">{user.email}</p>
      </div>

      <ProfilForm nomComplet={profile?.nom_complet ?? ""} telephone={profile?.telephone ?? ""} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Mes demandes de devis</h2>
          <Link href="/devis" className="text-sm text-accent-teal hover:underline">
            Nouvelle demande
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {demandes?.map((d) => (
            <Link
              key={d.id}
              href={`/devis/${d.id}`}
              className="flex items-center justify-between border border-base-600 bg-base-800 p-4 hover:border-accent-pink"
            >
              <div>
                <div className="font-semibold uppercase">Tapis {d.categorie}</div>
                <div className="text-sm text-ink-faint">
                  {new Date(d.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {d.prix_propose && <span className="text-accent-gold">{d.prix_propose} €</span>}
                <span className="text-sm text-ink-faint">{STATUTS_DEVIS_LABELS[d.statut]}</span>
              </div>
            </Link>
          ))}
          {!demandes?.length && (
            <p className="text-sm text-ink-faint">Aucune demande pour l&apos;instant.</p>
          )}
        </div>
      </div>

      <Link href="/compte/commandes" className="text-sm text-accent-teal hover:underline">
        Voir mes commandes →
      </Link>
    </div>
  );
}
