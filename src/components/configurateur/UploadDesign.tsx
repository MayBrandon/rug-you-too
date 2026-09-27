"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";

interface FichierUploade {
  chemin: string;
  nom: string;
}

interface UploadDesignProps {
  fichiers: FichierUploade[];
  onChange: (fichiers: FichierUploade[]) => void;
  requis?: boolean;
}

const MAX_FICHIERS = 5;
const TAILLE_MAX_MO = 8;

/**
 * Upload optionnel d'un logo/motif/photo pour la personnalisation sur-mesure.
 * Les fichiers vont dans le bucket privé "devis-uploads", sous
 * {user.id}/temp/{fichier} tant que la demande n'existe pas encore — la
 * policy RLS du bucket autorise un client à écrire dans son propre dossier
 * (voir supabase/migrations/0005_storage.sql).
 */
export function UploadDesign({ fichiers, onChange, requis = false }: UploadDesignProps) {
  const { user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setErreur(null);

    if (!user) {
      setErreur("Connecte-toi pour envoyer un fichier.");
      return;
    }

    if (fichiers.length + fileList.length > MAX_FICHIERS) {
      setErreur(`${MAX_FICHIERS} fichiers maximum.`);
      return;
    }

    const supabase = createClient();
    setEnvoi(true);

    const nouveaux: FichierUploade[] = [];

    for (const file of Array.from(fileList)) {
      if (file.size > TAILLE_MAX_MO * 1024 * 1024) {
        setErreur(`"${file.name}" dépasse ${TAILLE_MAX_MO} Mo.`);
        continue;
      }

      const chemin = `${user.id}/temp/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("devis-uploads").upload(chemin, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        setErreur(`Échec de l'envoi de "${file.name}" : ${error.message}`);
        continue;
      }

      nouveaux.push({ chemin, nom: file.name });
    }

    onChange([...fichiers, ...nouveaux]);
    setEnvoi(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function supprimer(chemin: string) {
    const supabase = createClient();
    await supabase.storage.from("devis-uploads").remove([chemin]);
    onChange(fichiers.filter((f) => f.chemin !== chemin));
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl">
        {requis ? "Ta photo ou ton design de référence" : "Personnalisation (optionnel)"}
      </h2>
      <p className="text-[15px] text-ink-muted">
        {requis
          ? "Un logo, un motif ou une photo d'inspiration — indispensable pour qu'on puisse chiffrer et tufter ton tapis précisément."
          : "Un logo, un motif ou une photo à reproduire sur ton tapis."}{" "}
        {MAX_FICHIERS} fichiers max, {TAILLE_MAX_MO} Mo chacun.
      </p>

      {!user && (
        <p className="border border-accent-gold/50 bg-base-800 p-3 text-sm text-accent-gold">
          Connecte-toi pour pouvoir joindre un fichier — tu peux aussi continuer sans et l'envoyer
          plus tard.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,.pdf"
        disabled={!user || envoi}
        onChange={(e) => handleFiles(e.target.files)}
        className="text-sm text-ink-muted file:mr-4 file:-skew-x-[8deg] file:border-0 file:bg-accent-teal file:px-5 file:py-2.5 file:text-sm file:font-bold file:uppercase file:text-base-950"
      />

      {envoi && <p className="text-sm text-ink-faint">Envoi en cours…</p>}
      {erreur && <p className="text-sm text-accent-pink">{erreur}</p>}

      {fichiers.length > 0 && (
        <ul className="flex flex-col gap-2">
          {fichiers.map((f) => (
            <li
              key={f.chemin}
              className="flex items-center justify-between border border-base-600 bg-base-800 px-4 py-2 text-sm"
            >
              <span className="truncate">{f.nom}</span>
              <button
                type="button"
                onClick={() => supprimer(f.chemin)}
                className="text-accent-pink hover:underline"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
