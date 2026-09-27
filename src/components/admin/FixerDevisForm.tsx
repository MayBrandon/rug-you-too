"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface FixerDevisFormProps {
  demandeId: string;
  prixSuggere: number;
}

export function FixerDevisForm({ demandeId, prixSuggere }: FixerDevisFormProps) {
  const router = useRouter();
  const [prix, setPrix] = useState(String(prixSuggere));
  const [delai, setDelai] = useState("7");
  const [note, setNote] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);

    try {
      const res = await fetch(`/api/admin/devis/${demandeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prixPropose: prix,
          delaiEstimeJours: delai || undefined,
          noteAdmin: note || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErreur(body?.error?._errors?.[0] ?? body?.error ?? "Erreur lors de l'envoi du devis.");
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-base-600 bg-base-800 p-6">
      <h3 className="font-display text-xl">Fixer le devis</h3>

      <label className="flex flex-col gap-1 text-sm">
        Prix final (€)
        <input
          type="number"
          min="0"
          step="0.01"
          required
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
          className="border border-base-600 bg-base-950 p-2.5 text-[15px] focus:border-accent-pink focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Délai estimé (jours)
        <input
          type="number"
          min="1"
          value={delai}
          onChange={(e) => setDelai(e.target.value)}
          className="border border-base-600 bg-base-950 p-2.5 text-[15px] focus:border-accent-pink focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Note interne (jamais visible du client)
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border border-base-600 bg-base-950 p-2.5 text-[15px] focus:border-accent-pink focus:outline-none"
        />
      </label>

      {erreur && <p className="text-sm text-accent-pink">{erreur}</p>}

      <Button variant="teal" disabled={envoi} className="justify-center">
        {envoi ? "Envoi…" : "Envoyer le devis au client"}
      </Button>
    </form>
  );
}
