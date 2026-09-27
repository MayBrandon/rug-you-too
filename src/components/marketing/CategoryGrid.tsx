import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

const BORDER_COLORS = ["border-accent-gold", "border-accent-pink", "border-accent-teal", "border-accent-violet"];

export function CategoryGrid() {
  return (
    <section className="flex flex-col gap-12 px-16 py-24">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-bold uppercase tracking-[2px] text-accent-pink">Nos univers</span>
        <h2 className="font-display text-4xl">Quatre terrains de jeu</h2>
      </div>

      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.slug}
            href={`/${c.slug}`}
            className={`flex flex-col gap-4 border-t-4 bg-base-800 p-5 ${BORDER_COLORS[i % BORDER_COLORS.length]}`}
          >
            <div className="flex h-[190px] items-center justify-center bg-base-700 text-sm font-semibold uppercase text-ink-faint">
              [Tapis {c.label.toLowerCase()}]
            </div>
            <h3 className="font-display text-xl">{c.label}</h3>
            <p className="text-[15px] text-ink-muted">{c.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
