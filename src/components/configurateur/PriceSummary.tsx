import type { CategorieTapis, TypeOption } from "@/types/database.types";
import type { OptionCatalogue } from "@/lib/catalogue";

interface PriceSummaryProps {
  categorie: CategorieTapis;
  options: Record<TypeOption, OptionCatalogue[]>;
  selection: Partial<Record<TypeOption, string>>;
  prixIndicatif: number;
}

const ETAPES: { type: TypeOption; label: string }[] = [
  { type: "taille", label: "Taille" },
  { type: "forme", label: "Forme" },
  { type: "couleur", label: "Couleur" },
  { type: "matiere", label: "Matière" },
];

export function PriceSummary({ categorie, options, selection, prixIndicatif }: PriceSummaryProps) {
  return (
    <aside className="flex h-fit flex-col gap-5 border border-base-600 bg-base-800 p-6">
      <h3 className="font-display text-xl">Ton tapis {categorie}</h3>

      <ul className="flex flex-col gap-2 text-sm">
        {ETAPES.map((etape) => {
          const valeur = selection[etape.type];
          const option = valeur ? options[etape.type].find((o) => o.label === valeur) : undefined;
          return (
            <li key={etape.type} className="flex justify-between border-b border-base-600 pb-2">
              <span className="text-ink-faint">{etape.label}</span>
              <span className={option ? "text-ink-light" : "text-ink-faint"}>
                {option ? option.label : "—"}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex items-baseline justify-between pt-2">
        <span className="text-sm uppercase text-ink-faint">Prix indicatif</span>
        <span className="font-display text-3xl text-accent-gold">{prixIndicatif} €</span>
      </div>
      <p className="text-xs text-ink-faint">
        Prix de départ — confirmé par devis avant toute production, notamment si tu ajoutes une
        personnalisation sur mesure.
      </p>
    </aside>
  );
}
