"use client";

import { clsx } from "clsx";
import type { OptionCatalogue } from "@/lib/catalogue";

interface StepCouleursProps {
  options: OptionCatalogue[];
  valeurs: string[];
  onChange: (valeurs: string[]) => void;
}

const HEX_REGEX = /^#[0-9a-fA-F]{3,8}$/;

/**
 * Sélection de couleurs — plusieurs choix possibles (ex: un dégradé, un motif
 * bicolore). Même principe que StepOption (sélection par label), mais en
 * cases à cocher plutôt qu'en choix unique.
 */
export function StepCouleurs({ options, valeurs, onChange }: StepCouleursProps) {
  function toggle(label: string) {
    if (valeurs.includes(label)) {
      onChange(valeurs.filter((v) => v !== label));
    } else {
      onChange([...valeurs, label]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl">Couleurs</h2>
      <p className="text-[15px] text-ink-muted">Choisis une ou plusieurs couleurs pour ton tapis.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {options.map((option) => {
          const selected = valeurs.includes(option.label);
          const swatch = HEX_REGEX.test(option.valeur) ? option.valeur : null;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.label)}
              className={clsx(
                "flex flex-col items-start gap-2 border p-4 text-left transition-colors",
                selected
                  ? "border-accent-pink bg-base-700"
                  : "border-base-600 bg-base-800 hover:border-ink-faint"
              )}
            >
              <div className="flex w-full items-center justify-between">
                {swatch && (
                  <span
                    className={clsx(
                      "h-8 w-8 rounded-full border-2",
                      selected ? "border-accent-pink" : "border-base-600"
                    )}
                    style={{ backgroundColor: swatch }}
                  />
                )}
                {selected && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-accent-pink text-xs font-bold text-base-950">
                    ✓
                  </span>
                )}
              </div>
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
