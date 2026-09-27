import Link from "next/link";
import { CATEGORIES, SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="flex flex-col gap-12 border-t-[3px] border-accent-pink bg-base-800 px-16 py-16 text-ink-faint">
      <div className="flex justify-between gap-12">
        <div className="flex max-w-[320px] flex-col gap-4">
          <span className="font-display text-xl uppercase text-ink-light">{SITE_NAME}</span>
          <p className="text-[15px] leading-snug">
            Tapis personnalisés pour voiture, sol, mur et bureau. Nom de domaine à définir.
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-3 text-[15px]">
            <span className="text-sm font-bold uppercase tracking-wide text-ink-light">Catégories</span>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className="hover:text-accent-pink">
                {c.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3 text-[15px]">
            <span className="text-sm font-bold uppercase tracking-wide text-ink-light">Navigation</span>
            <Link href="/comment-ca-marche" className="hover:text-accent-pink">Le process</Link>
            <Link href="/devis" className="hover:text-accent-pink">Devis</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-base-600 pt-6 text-sm">
        © {new Date().getFullYear()} {SITE_NAME}
      </div>
    </footer>
  );
}
