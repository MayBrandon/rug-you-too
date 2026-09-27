"use client";

import { clsx } from "clsx";
import type { ConfigOption } from "@/lib/configurateur-options";

interface StepOptionProps {
  label: string;
  options: ConfigOption[];
  valeur: string | undefined;
  onChange: (valeur: string) => void;
}

/**
 * Une étape du configurateur (taille, forme, couleur ou matière) : une grille
 * de cartes sélectionnables. Les couleurs affichent une pastille (swatch),
 * les autres juste le label + le supplément de prix s'il y en a un.
 */
export function StepOption({ label, options, valeur, onChange }: StepOptionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl">{label}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const selected = option.value === valeur;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={clsx(
                "flex flex-col items-start gap-2 border p-4 text-left transition-colors",
                selected
                  ? "border-accent-pink bg-base-700"
                  : "border-base-600 bg-base-800 hover:border-ink-faint"
              )}
            >
              {option.swatch && (
                <span
                  className={clsx(
                    "h-8 w-8 rounded-full border-2",
                    selected ? "border-accent-pink" : "border-base-600"
                  )}
                  style={{ backgroundColor: option.swatch }}
                />
              )}
              <span className="text-[15px] font-semibold">{option.label}</span>
              {option.supplementPrix > 0 && (
                <span className="text-xs text-ink-faint">+{option.supplementPrix} €</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
