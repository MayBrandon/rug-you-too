import type { CategorieTapis, TypeOption } from "@/types/database.types";
import type { OptionCatalogue } from "@/lib/catalogue";

interface Selection {
  taille?: string;
  forme?: string;
  couleurs?: string[];
}

interface PriceSummaryProps {
  categorie: CategorieTapis;
  options: Record<TypeOption, OptionCatalogue[]>;
  selection: Selection;
  prixIndicatif: number;
}

export function PriceSummary({ categorie, selection, prixIndicatif }: PriceSummaryProps) {
  return (
    <aside className="flex h-fit flex-col gap-5 border border-base-600 bg-base-800 p-6">
      <h3 className="font-display text-xl">Ton tapis {categorie}</h3>

      <ul className="flex flex-col gap-2 text-sm">
        <li className="flex justify-between border-b border-base-600 pb-2">
          <span className="text-ink-faint">Taille</span>
          <span className={selection.taille ? "text-ink-light" : "text-ink-faint"}>
            {selection.taille ?? "—"}
          </span>
        </li>
        <li className="flex justify-between border-b border-base-600 pb-2">
          <span className="text-ink-faint">Forme</span>
          <span className={selection.forme ? "text-ink-light" : "text-ink-faint"}>
            {selection.forme ?? "—"}
          </span>
        </li>
        <li className="flex justify-between gap-4 border-b border-base-600 pb-2">
          <span className="shrink-0 text-ink-faint">Couleurs</span>
          <span className={selection.couleurs?.length ? "text-right text-ink-light" : "text-ink-faint"}>
            {selection.couleurs?.length ? selection.couleurs.join(", ") : "—"}
          </span>
        </li>
      </ul>

      <div className="flex items-baseline justify-between pt-2">
        <span className="text-sm uppercase text-ink-faint">Prix indicatif</span>
        <span className="font-display text-3xl text-accent-gold">{prixIndicatif} €</span>
      </div>
      <p className="text-xs text-ink-faint">
        Estimation tufté main, avant devis — confirmée (et ajustée si besoin) par Brandon une fois ta
        demande envoyée.
      </p>
    </aside>
  );
}
