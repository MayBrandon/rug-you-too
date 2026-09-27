"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { STATUTS_COMMANDE_LABELS } from "@/lib/constants";
import type { StatutCommande, CategorieTapis } from "@/types/database.types";

export interface CommandeRowData {
  id: string;
  demandeDevisId: string;
  categorie: CategorieTapis | null;
  clientNom: string | null;
  clientTelephone: string | null;
  prixFinal: number;
  statut: StatutCommande;
  numeroSuivi: string | null;
  transporteur: string | null;
  createdAt: string;
}

const STATUTS: StatutCommande[] = [
  "en_attente_paiement",
  "payee",
  "en_production",
  "expediee",
  "livree",
  "annulee",
];

export function CommandeRow({ commande }: { commande: CommandeRowData }) {
  const router = useRouter();
  const [statut, setStatut] = useState<StatutCommande>(commande.statut);
  const [numeroSuivi, setNumeroSuivi] = useState(commande.numeroSuivi ?? "");
  const [transporteur, setTransporteur] = useState(commande.transporteur ?? "");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const modifie =
    statut !== commande.statut ||
    numeroSuivi !== (commande.numeroSuivi ?? "") ||
    transporteur !== (commande.transporteur ?? "");

  async function enregistrer() {
    setEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch(`/api/admin/commandes/${commande.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut, numeroSuivi, transporteur }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErreur(body?.error?._errors?.[0] ?? body?.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      router.refresh();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 border border-base-600 bg-base-800 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-semibold uppercase">
            Tapis {commande.categorie ?? "—"}
            <Link
              href={`/admin/devis/${commande.demandeDevisId}`}
              className="ml-2 text-xs font-normal normal-case text-accent-teal hover:underline"
            >
              voir la demande
            </Link>
          </div>
          <div className="text-xs text-ink-faint">
            {commande.clientNom ?? "Client sans nom"}
            {commande.clientTelephone ? ` — ${commande.clientTelephone}` : ""}
            {" · "}
            {new Date(commande.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
        <span className="font-display text-xl text-accent-gold">{commande.prixFinal} €</span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-ink-faint">
          Statut
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value as StatutCommande)}
            className="border border-base-600 bg-base-950 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
          >
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {STATUTS_COMMANDE_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-faint">
          Transporteur
          <input
            value={transporteur}
            onChange={(e) => setTransporteur(e.target.value)}
            placeholder="Ex : Colissimo"
            className="w-40 border border-base-600 bg-base-950 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-faint">
          N° de suivi
          <input
            value={numeroSuivi}
            onChange={(e) => setNumeroSuivi(e.target.value)}
            className="w-48 border border-base-600 bg-base-950 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
          />
        </label>

        {modifie && (
          <button
            type="button"
            onClick={enregistrer}
            disabled={envoi}
            className="bg-accent-teal px-3 py-2 text-xs font-bold uppercase text-base-950"
          >
            {envoi ? "…" : "Enregistrer"}
          </button>
        )}
      </div>
      {erreur && <p className="text-xs text-accent-pink">{erreur}</p>}
    </div>
  );
}
