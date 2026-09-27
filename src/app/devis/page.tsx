import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export default function DevisPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-8 py-20 text-center">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-bold uppercase tracking-[2px] text-accent-pink">Devis gratuit</span>
        <h1 className="font-display text-4xl">Par quel tapis on commence ?</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/configurateur/${c.slug}`}
            className="flex flex-col gap-2 border border-base-600 bg-base-800 p-8 text-left hover:border-accent-pink"
          >
            <h2 className="font-display text-2xl">{c.label}</h2>
            <p className="text-[15px] text-ink-muted">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
