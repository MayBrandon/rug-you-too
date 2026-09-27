"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <ConnexionForm />
    </Suspense>
  );
}

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErreur(error.message);
        return;
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      setErreur(
        err instanceof Error
          ? `Erreur technique : ${err.message}`
          : "Une erreur inattendue est survenue."
      );
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-8 py-20">
      <h1 className="font-display text-3xl">Connexion</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-base-600 bg-base-800 p-3 text-[15px] focus:border-accent-pink focus:outline-none"
        />
        {erreur && <p className="text-sm text-accent-pink">{erreur}</p>}
        <Button variant="pink" className="w-full justify-center" disabled={envoi}>
          {envoi ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <p className="text-sm text-ink-faint">
        Pas encore de compte ?{" "}
        <Link href={`/auth/inscription?next=${encodeURIComponent(next)}`} className="text-accent-pink">
          Crée-en un
        </Link>
      </p>
    </div>
  );
}
