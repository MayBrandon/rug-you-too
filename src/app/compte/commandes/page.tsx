import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STATUTS_COMMANDE_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ComptesCommandesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: commandes } = await supabase
    .from("commandes")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Mes commandes</h1>
        <Link href="/compte" className="text-sm text-accent-teal hover:underline">
          ← Mon compte
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {commandes?.map((c) => (
          <div key={c.id} className="flex flex-col gap-2 border border-base-600 bg-base-800 p-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-xl">{STATUTS_COMMANDE_LABELS[c.statut]}</span>
              <span className="font-display text-xl text-accent-gold">{c.prix_final} €</span>
            </div>
            {c.numero_suivi && (
              <p className="text-sm text-ink-muted">
                Suivi {c.transporteur ? `${c.transporteur} — ` : ""}
                <span className="text-ink-light">{c.numero_suivi}</span>
              </p>
            )}
            <p className="text-xs text-ink-faint">
              Commande du{" "}
              {new Date(c.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        ))}
        {!commandes?.length && <p className="text-sm text-ink-faint">Aucune commande pour l&apos;instant.</p>}
      </div>
    </div>
  );
}
