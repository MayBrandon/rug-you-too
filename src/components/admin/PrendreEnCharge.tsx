"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function PrendreEnCharge({ demandeId }: { demandeId: string }) {
  const router = useRouter();
  const [envoi, setEnvoi] = useState(false);

  async function handleClick() {
    setEnvoi(true);
    try {
      await fetch(`/api/admin/devis/${demandeId}`, { method: "POST" });
      router.refresh();
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={envoi}>
      {envoi ? "…" : "Prendre en charge"}
    </Button>
  );
}
