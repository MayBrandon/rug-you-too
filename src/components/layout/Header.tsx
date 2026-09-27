import Link from "next/link";
import { CATEGORIES, SITE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="flex h-[88px] items-center justify-between border-b-[3px] border-accent-pink bg-base-800 px-16">
      <Link href="/" className="flex items-center gap-3">
        <span className="flex h-[42px] w-[42px] -skew-x-[8deg] items-center justify-center bg-gradient-to-br from-accent-pink to-accent-violet">
          <span className="skew-x-[8deg] font-display text-xl text-base-950">R</span>
        </span>
        <span className="font-display text-2xl uppercase">{SITE_NAME}</span>
      </Link>

      <nav className="hidden items-center gap-9 text-base font-semibold uppercase tracking-wide text-ink-muted md:flex">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/${c.slug}`} className="hover:text-accent-pink">
            {c.label}
          </Link>
        ))}
        <Link href="/comment-ca-marche" className="hover:text-accent-pink">
          Le process
        </Link>
      </nav>

      <Button href="/devis" variant="teal">
        Demander un devis
      </Button>
    </header>
  );
}
