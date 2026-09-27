import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { Configurateur } from "@/components/configurateur/Configurateur";
import type { CategorieTapis } from "@/types/database.types";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ categorie: c.slug }));
}

export default function ConfigurateurPage({ params }: { params: { categorie: string } }) {
  const categorie = CATEGORIES.find((c) => c.slug === params.categorie);

  if (!categorie) notFound();

  return (
    <Configurateur categorie={categorie.slug as CategorieTapis} categorieLabel={categorie.label} />
  );
}
