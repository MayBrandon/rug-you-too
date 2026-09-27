import { Hero } from "@/components/marketing/Hero";
import { CategoryGrid } from "@/components/marketing/CategoryGrid";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      {/* À suivre : ProcessSteps, Showcase, Testimonials, CTASection —
          composants à écrire dans src/components/marketing/ sur le même modèle. */}
    </>
  );
}
