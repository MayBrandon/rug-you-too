"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CategorieTapis } from "@/types/database.types";
import { Button } from "@/components/ui/Button";

export interface ProduitRowClient {
  id: string;
  categorie: CategorieTapis;
  nom: string;
  prixBase: number;
  actif: boolean;
  ordre: number;
}

interface ProduitsPanelProps {
  categorie: CategorieTapis;
  produits: ProduitRowClient[];
}

/**
 * Le premier produit actif (trié par ordre) sert de prix de base affiché
 * dans le configurateur — voir src/lib/catalogue.ts::getProduitBase.
 * On le rappelle ici pour éviter que Brandon désactive tout par erreur.
 */
export function ProduitsPanel({ categorie, produits }: ProduitsPanelProps) {
  const router = useRouter();
  const [ajoutOuvert, setAjoutOuvert] = useState(false);

  const produitsTries = [...produits].sort((a, b) => a.ordre - b.ordre);
  const produitBaseId = produitsTries.find((p) => p.actif)?.id;

  return (
    <section className="flex flex-col gap-4 border border-base-600 bg-base-800 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Prix de base — {categorie}</h2>
        <Button variant="outline" onClick={() => setAjoutOuvert((v) => !v)} className="px-4 py-2 text-xs">
          {ajoutOuvert ? "Annuler" : "+ Ajouter"}
        </Button>
      </div>

      <p className="text-xs text-ink-faint">
        Le premier produit actif (le plus haut par ordre) fixe le prix de départ affiché aux clients
        pour cette catégorie.
      </p>

      {ajoutOuvert && (
        <NouveauProduitForm
          categorie={categorie}
          onCreated={() => {
            setAjoutOuvert(false);
            router.refresh();
          }}
        />
      )}

      <div className="flex flex-col gap-2">
        {produitsTries.map((produit) => (
          <ProduitRow
            key={produit.id}
            produit={produit}
            estPrixBase={produit.id === produitBaseId}
            onSaved={() => router.refresh()}
          />
        ))}
        {produitsTries.length === 0 && (
          <p className="text-sm text-ink-faint">Aucun produit pour cette catégorie.</p>
        )}
      </div>
    </section>
  );
}

function ProduitRow({
  produit,
  estPrixBase,
  onSaved,
}: {
  produit: ProduitRowClient;
  estPrixBase: boolean;
  onSaved: () => void;
}) {
  const [nom, setNom] = useState(produit.nom);
  const [prixBase, setPrixBase] = useState(String(produit.prixBase));
  const [ordre, setOrdre] = useState(String(produit.ordre));
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const modifie = nom !== produit.nom || prixBase !== String(produit.prixBase) || ordre !== String(produit.ordre);

  async function enregistrer() {
    setEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch(`/api/admin/produits/${produit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prixBase, ordre }),
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
      await fetch(`/api/admin/produits/${produit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actif: !produit.actif }),
      });
      onSaved();
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer() {
    if (!confirm(`Supprimer "${produit.nom}" ? Impossible si des demandes de devis y sont liées.`)) return;
    setEnvoi(true);
    try {
      const res = await fetch(`/api/admin/produits/${produit.id}`, { method: "DELETE" });
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
      className={`flex flex-wrap items-center gap-3 border p-3 text-sm ${
        produit.actif ? "border-base-600" : "border-base-700 opacity-50"
      }`}
    >
      {estPrixBase && (
        <span className="rounded-sm bg-accent-gold px-2 py-0.5 text-[10px] font-bold uppercase text-base-950">
          Prix affiché
        </span>
      )}
      <input
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        className="min-w-[160px] flex-1 border border-base-600 bg-base-950 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
      />
      <label className="flex items-center gap-1 text-xs text-ink-faint">
        Prix
        <input
          type="number"
          min="0"
          step="0.01"
          value={prixBase}
          onChange={(e) => setPrixBase(e.target.value)}
          className="w-24 border border-base-600 bg-base-950 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
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
        {produit.actif ? "Désactiver" : "Activer"}
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

function NouveauProduitForm({ categorie, onCreated }: { categorie: CategorieTapis; onCreated: () => void }) {
  const [nom, setNom] = useState("");
  const [prixBase, setPrixBase] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch("/api/admin/produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorie, nom, prixBase }),
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
      <label className="flex flex-col gap-1 text-xs text-ink-faint">
        Nom
        <input
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Ex : Tapis Voiture — Édition GTA"
          className="w-64 border border-base-600 bg-base-900 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink-faint">
        Prix de base (€)
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={prixBase}
          onChange={(e) => setPrixBase(e.target.value)}
          className="w-28 border border-base-600 bg-base-900 p-2 text-[15px] focus:border-accent-pink focus:outline-none"
        />
      </label>
      <Button variant="teal" disabled={envoi} className="px-4 py-2.5 text-xs">
        {envoi ? "…" : "Créer"}
      </Button>
      {erreur && <p className="w-full text-xs text-accent-pink">{erreur}</p>}
    </form>
  );
}
