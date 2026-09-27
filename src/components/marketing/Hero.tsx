import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative flex items-center gap-16 overflow-hidden border-b-[6px] border-accent-pink bg-gradient-to-br from-base-900 via-[#2A123C] to-[#3C1240] px-16 py-24">
      <div className="z-10 flex max-w-[580px] flex-col gap-6">
        <span className="inline-flex w-fit -skew-x-[8deg] bg-accent-gold px-4 py-2 text-sm font-bold uppercase tracking-wide text-base-950">
          <span className="block skew-x-[8deg]">100% sur mesure</span>
        </span>
        <h1 className="font-display text-[68px] leading-[0.98]">
          Ton tapis.
          <br />
          <span className="text-accent-pink">Tes règles.</span>
        </h1>
        <p className="max-w-[520px] text-lg leading-relaxed text-ink-muted">
          Voiture, sol, mur ou bureau — configure la taille, la forme, la couleur et la
          matière, ajoute ton logo ou ton design, et reçois un devis avant fabrication.
        </p>
        <div className="mt-2 flex gap-4">
          <Button href="/devis" variant="pink">Créer mon tapis</Button>
          <Button href="/voiture" variant="outline">Voir le catalogue</Button>
        </div>
      </div>

      <div className="z-10 flex h-[500px] flex-1 items-center justify-center border-2 border-base-600 bg-base-700">
        <span className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
          [Photo tapis personnalisé]
        </span>
      </div>
    </section>
  );
}
