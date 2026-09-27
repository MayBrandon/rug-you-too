"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategorieTapis, TypeOption } from "@/types/database.types";
import { calculerPrixCatalogue, type OptionCatalogue } from "@/lib/catalogue";
import { StepOption } from "./StepOption";
import { UploadDesign } from "./UploadDesign";
import { PriceSummary } from "./PriceSummary";
import { Button } from "@/components/ui/Button";
import { useUser } from "@/hooks/useUser";

interface ConfigurateurProps {
  categorie: CategorieTapis;
  categorieLabel: string;
  prixBase: number;
  options: Record<TypeOption, OptionCatalogue[]>;
}

type Selection = Partial<Record<TypeOption, string>>;
type Etape = TypeOption | "personnalisation" | "recap";

const ETAPES: { type: TypeOption; label: string }[] = [
  { type: "taille", label: "Taille" },
  { type: "forme", label: "Forme" },
  { type: "couleur", label: "Couleur" },
  { type: "matiere", label: "Matière" },
];

const ORDRE_ETAPES: Etape[] = [...ETAPES.map((e) => e.type), "personnalisation", "recap"];

export function Configurateur({ categorie, categorieLabel, prixBase, options }: ConfigurateurProps) {
  const router = useRouter();
  const { user } = useUser();

  const [etapeIndex, setEtapeIndex] = useState(0);
  const [selection, setSelection] = useState<Selection>({});
  const [fichiers, setFichiers] = useState<{ chemin: string; nom: string }[]>([]);
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const etapeActuelle = ORDRE_ETAPES[etapeIndex];
  const prix = useMemo(
    () => calculerPrixCatalogue(prixBase, options, selection),
    [prixBase, options, selection]
  );

  const etapeConfigValide =
    etapeActuelle === "personnalisation" || etapeActuelle === "recap"
      ? true
      : Boolean(selection[etapeActuelle as TypeOption]);

  function suivant() {
    if (etapeIndex < ORDRE_ETAPES.length - 1) setEtapeIndex(etapeIndex + 1);
  }

  function precedent() {
    if (etapeIndex > 0) setEtapeIndex(etapeIndex - 1);
  }

  async function envoyerDemande() {
    if (!user) {
      router.push(`/auth/connexion?next=/configurateur/${categorie}`);
      return;
    }

    setEnvoi(true);
    setErreur(null);

    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categorie,
          configuration: selection,
          fichiersUrls: fichiers.map((f) => f.chemin),
          messageClient: message || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErreur(body?.error?._errors?.[0] ?? body?.error ?? "Une erreur est survenue.");
        return;
      }

      const { demande } = await res.json();
      router.push(`/devis/${demande.id}`);
    } catch (err) {
      setErreur(
        err instanceof Error ? `Erreur technique : ${err.message}` : "Une erreur inattendue est survenue."
      );
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-8 py-16 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-[2px] text-accent-pink">
            Configurateur — {categorieLabel}
          </span>
          <div className="flex gap-1">
            {ORDRE_ETAPES.map((etape, i) => (
              <div
                key={etape}
                className={`h-1 flex-1 ${i <= etapeIndex ? "bg-accent-pink" : "bg-base-600"}`}
              />
            ))}
          </div>
        </div>

        {etapeActuelle !== "personnalisation" && etapeActuelle !== "recap" && (
          <StepOption
            label={ETAPES.find((e) => e.type === etapeActuelle)!.label}
            options={options[etapeActuelle as TypeOption]}
            valeur={selection[etapeActuelle as TypeOption]}
            onChange={(valeur) =>
              setSelection((s) => ({ ...s, [etapeActuelle as TypeOption]: valeur }))
            }
          />
        )}

        {etapeActuelle === "personnalisation" && (
          <UploadDesign fichiers={fichiers} onChange={setFichiers} />
        )}

        {etapeActuelle === "recap" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl">Un mot sur ton projet ? (optionnel)</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Précise ici tout détail utile : délai souhaité, contexte du logo, contrainte particulière…"
              className="border border-base-600 bg-base-800 p-4 text-[15px] text-ink-light placeholder:text-ink-faint focus:border-accent-pink focus:outline-none"
            />
            {erreur && <p className="text-sm text-accent-pink">{erreur}</p>}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={precedent} {...(etapeIndex === 0 ? { disabled: true } : {})}>
            Précédent
          </Button>

          {etapeActuelle === "recap" ? (
            <Button variant="pink" onClick={envoyerDemande} disabled={envoi}>
              {envoi ? "Envoi…" : "Envoyer ma demande de devis"}
            </Button>
          ) : (
            <Button variant="teal" onClick={suivant} disabled={!etapeConfigValide}>
              Suivant
            </Button>
          )}
        </div>
      </div>

      <PriceSummary categorie={categorie} options={options} selection={selection} prixIndicatif={prix} />
    </div>
  );
}
