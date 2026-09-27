"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import type { CategorieTapis, TypeOption } from "@/types/database.types";
import { Button } from "@/components/ui/Button";

export interface OptionRowClient {
  id: string;
  categorie: CategorieTapis;
  type: TypeOption;
  label: string;
  valeur: string;
  supplementPrix: number;
  actif: boolean;
  ordre: number;
}

interface OptionsPanelProps {
  categorie: CategorieTapis;
  type: TypeOption;
  label: string;
  options: OptionRowClient[];
}

const HEX_REGEX = /^#[0-9a-fA-F]{3,8}$/;

export function OptionsPanel({ categorie, type, label, options }: OptionsPanelProps) {
  const router = useRouter();
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const optionsTriees = [...options].sort((a, b) => a.ordre - b.ordre);

  return (
    <section className="flex flex-col gap-4 border border-base-600 bg-base-800 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">{label}</h2>
        <Button variant="outline" onClick={() => setAjoutOuvert((v) => !v)} className="px-4 py-2 text-xs">
          {ajoutOuvert ? "Annuler" : "+ Ajouter"}
        </Button>
      </div>

      {ajoutOuvert && (
        <NouvelleOptionForm
          categorie={categorie}
          type={type}
          onCreated={() => {
            setAjoutOuvert(false);
            router.refresh();
          }}
        />
      )}

      <div className="flex flex-col gap-2">
        {optionsTriees.map((option) => (
          <OptionRow key={option.id} option={option} onSaved={() => router.refresh()} />
        ))}
        {optionsTriees.length === 0 && (
          <p className="text-sm text-ink-faint">Aucune option pour l&apos;instant.</p>
        )}
      </div>
    </section>
  );
}

function OptionRow({ option, onSaved }: { option: OptionRowClient; onSaved: () => void }) {
  const [label, setLabel] = useState(option.label);
  const [valeur, setValeur] = useState(option.valeur);
  const [supplement, setSupplement] = useState(String(option.supplementPrix));
  const [ordre, setOrdre] = useState(String(option.ordre));
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const estCouleur = option.type === "couleur";
  const modifie =
    label !== option.label ||
    valeur !== option.valeur ||
    supplement !== String(option.supplementPrix) ||
    ordre !== String(option.ordre);

  async function enregistrer() {
    setEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch(`/api/admin/options/${option.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, valeur, supplementPrix: supplement, ordre }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErreur(body?.error?._errors?.[0] ?? body?.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      onSaved();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setEnvoi(false);
    }
  }

  async function toggleActif() {
    setEnvoi(true);
    try {
      await fetch(`/api/admin/options/${option.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actif: !option.actif }),
      });
      onSaved();
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer() {
    if (!confirm(`Supprimer "${option.label}" ?`)) return;
    setEnvoi(true);
    try {
      const res = await fetch(`/api/admin/options/${option.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErreur(body?.error ?? "Suppression impossible.");
        return;
      }
      onSaved();
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div
      className={clsx(
        "flex flex-wrap items-center gap-2 border p-3 text-sm",
        option.actif ? "border-base-600" : "border-base-700 opacity-50"
      )}
    >
      {estCouleur && (
        <input
          type="color"
          value={HEX_REGEX.test(valeur) ? valeur : "#000000"}
          onChange={(e) => setValeur(e.target.value)}
          className="h-9 w-9 cursor-pointer border border-base-600 bg-transparent p-0"
        />
      )}
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="min-w-[140px] flex-1 border border-base-600 bg-base-950 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
      />
      {!estCouleur && (
        <input
          value={valeur}
          onChange={(e) => setValeur(e.target.value)}
          placeholder="Info libre (optionnel)"
          className="w-40 border border-base-600 bg-base-950 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
        />
      )}
      <label className="flex items-center gap-1 text-xs text-ink-faint">
        Supp.
        <input
          type="number"
          step="0.01"
          value={supplement}
          onChange={(e) => setSupplement(e.target.value)}
          className="w-20 border border-base-600 bg-base-950 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
        />
        €
      </label>
      <label className="flex items-center gap-1 text-xs text-ink-faint">
        Ordre
        <input
          type="number"
          value={ordre}
          onChange={(e) => setOrdre(e.target.value)}
          className="w-16 border border-base-600 bg-base-950 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
        />
      </label>

      {modifie && (
        <button
          type="button"
          onClick={enregistrer}
          disabled={envoi}
          className="bg-accent-teal px-3 py-2 text-xs font-bold uppercase text-base-950"
        >
          Enregistrer
        </button>
      )}
      <button
        type="button"
        onClick={toggleActif}
        disabled={envoi}
        className="px-3 py-2 text-xs uppercase text-ink-faint hover:text-ink-light"
      >
        {option.actif ? "Désactiver" : "Activer"}
      </button>
      <button
        type="button"
        onClick={supprimer}
        disabled={envoi}
        className="px-3 py-2 text-xs uppercase text-accent-pink hover:opacity-80"
      >
        Supprimer
      </button>
      {erreur && <p className="w-full text-xs text-accent-pink">{erreur}</p>}
    </div>
  );
}

function NouvelleOptionForm({
  categorie,
  type,
  onCreated,
}: {
  categorie: CategorieTapis;
  type: TypeOption;
  onCreated: () => void;
}) {
  const estCouleur = type === "couleur";
  const [label, setLabel] = useState("");
  const [valeur, setValeur] = useState(estCouleur ? "#151316" : "");
  const [supplement, setSupplement] = useState("0");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch("/api/admin/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorie, type, label, valeur, supplementPrix: supplement }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErreur(body?.error?._errors?.[0] ?? body?.error ?? "Erreur lors de la création.");
        return;
      }
      onCreated();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 border border-base-600 bg-base-950 p-3">
      {estCouleur && (
        <label className="flex flex-col gap-1 text-xs text-ink-faint">
          Couleur
          <input
            type="color"
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            className="h-10 w-14 cursor-pointer border border-base-600 bg-transparent p-0"
          />
        </label>
      )}
      <label className="flex flex-col gap-1 text-xs text-ink-faint">
        Label
        <input
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex : Bleu klein"
          className="w-52 border border-base-600 bg-base-900 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
        />
      </label>
      {!estCouleur && (
        <label className="flex flex-col gap-1 text-xs text-ink-faint">
          Info libre
          <input
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            placeholder="Optionnel"
            className="w-40 border border-base-600 bg-base-900 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
          />
        </label>
      )}
      <label className="flex flex-col gap-1 text-xs text-ink-faint">
        Supplément (€)
        <input
          type="number"
          step="0.01"
          value={supplement}
          onChange={(e) => setSupplement(e.target.value)}
          className="w-24 border border-base-600 bg-base-900 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
        />
      </label>
      <Button variant="teal" disabled={envoi} className="px-4 py-2.5 text-xs">
        {envoi ? "…" : "Ajouter"}
      </Button>
      {erreur && <p className="w-full text-xs text-accent-pink">{erreur}</p>}
    </form>
  );
}
