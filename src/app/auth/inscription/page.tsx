"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function InscriptionPage() {
  return (
    <Suspense fallback={null}>
      <InscriptionForm />
    </Suspense>
  );
}

function InscriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [nomComplet, setNomComplet] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [inscrit, setInscrit] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nom_complet: nomComplet },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    setEnvoi(false);
    if (error) {
      setErreur(error.message);
      return;
    }

    // Si la confirmation email est désactivée sur le projet Supabase, la
    // session est déjà active : on peut enchaîner directement.
    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }

    setInscrit(true);
  }

  if (inscrit) {
    return (
      <div className="mx-auto max-w-md px-8 py-20 text-center">
        <h1 className="font-display text-3xl">Vérifie ta boîte mail</h1>
        <p className="mt-4 text-ink-muted">
          On t&apos;a envoyé un lien de confirmation pour activer ton compte.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-8 py-20">
      <h1 className="font-display text-3xl">Créer un compte</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          required
          placeholder="Nom complet"
          value={nomComplet}
          onChange={(e) => setNomComplet(e.target.value)}
          className="border border-base-600 bg-base-800 p-3 text-[15px] focus:border-accent-pink focus:outline-none"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-base-600 bg-base-800 p-3 text-[15px] focus:border-accent-pink focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Mot de passe (6 caractères min.)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-base-600 bg-base-800 p-3 text-[15px] focus:border-accent-pink focus:outline-none"
        />
        {erreur && <p className="text-sm text-accent-pink">{erreur}</p>}
        <Button variant="pink" className="w-full justify-center" disabled={envoi}>
          {envoi ? "Création…" : "Créer mon compte"}
        </Button>
      </form>

      <p className="text-sm text-ink-faint">
        Déjà un compte ?{" "}
        <Link href={`/auth/connexion?next=${encodeURIComponent(next)}`} className="text-accent-pink">
          Connecte-toi
        </Link>
      </p>
    </div>
  );
}
