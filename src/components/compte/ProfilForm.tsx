"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ProfilFormProps {
  nomComplet: string;
  telephone: string;
}

export function ProfilForm({ nomComplet, telephone }: ProfilFormProps) {
  const [nom, setNom] = useState(nomComplet);
  const [tel, setTel] = useState(telephone);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/compte/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomComplet: nom, telephone: tel }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErreur(body?.error?._errors?.[0] ?? body?.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      setMessage("Coordonnées mises à jour.");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-base-600 bg-base-800 p-6 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm">
        Nom complet
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="border border-base-600 bg-base-950 p-2.5 text-[15px] focus:border-accent-pink focus:outline-none"
        />
      </label>
      <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-sm">
        Téléphone
        <input
          value={tel}
          onChange={(e) => setTel(e.target.value)}
          className="border border-base-600 bg-base-950 p-2.5 text-[15px] focus:border-accent-pink focus:outline-none"
        />
      </label>
      <Button variant="teal" disabled={envoi} className="justify-center">
        {envoi ? "…" : "Enregistrer"}
      </Button>
      {message && <p className="w-full text-sm text-accent-teal">{message}</p>}
      {erreur && <p className="w-full text-sm text-accent-pink">{erreur}</p>}
    </form>
  );
}
