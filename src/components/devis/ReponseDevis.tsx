"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ReponseDevis({ demandeId }: { demandeId: string }) {
  const router = useRouter();
  const [envoi, setEnvoi] = useState<"accepte" | "refuse" | null>(null);

  async function repondre(reponse: "accepte" | "refuse") {
    setEnvoi(reponse);
    const res = await fetch("/api/devis/reponse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demandeId, reponse }),
    });

    if (!res.ok) {
      setEnvoi(null);
      return;
    }

    const body = await res.json();
    if (body.paymentLinkUrl) {
      window.location.href = body.paymentLinkUrl;
      return;
    }

    setEnvoi(null);
    router.refresh();
  }

  return (
    <div className="flex gap-3">
      <Button variant="teal" onClick={() => repondre("accepte")} disabled={envoi !== null}>
        {envoi === "accepte" ? "…" : "Accepter et payer"}
      </Button>
      <Button variant="outline" onClick={() => repondre("refuse")} disabled={envoi !== null}>
        {envoi === "refuse" ? "…" : "Refuser"}
      </Button>
    </div>
  );
}
