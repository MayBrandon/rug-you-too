import { Button } from "@/components/ui/Button";

const ETAPES = [
  {
    titre: "1. Tu configures",
    texte:
      "Choisis ta catégorie (voiture, sol, mur, bureau), puis la taille, la forme et tes couleurs. Décris ton projet et ajoute une photo ou un design de référence.",
  },
  {
    titre: "2. On te propose un devis",
    texte:
      "On étudie ta demande et on te propose un prix ferme et un délai de fabrication, adaptés à ta configuration exacte.",
  },
  {
    titre: "3. Tu valides",
    texte: "Si le devis te convient, tu le valides et passes au paiement en toute sécurité.",
  },
  {
    titre: "4. On tufte ton tapis",
    texte:
      "Chaque tapis est tufté à la main, dans les règles de l'art, à partir de ta configuration — rien n'est produit en série.",
  },
  {
    titre: "5. Livraison",
    texte:
      "Ton tapis est expédié avec un numéro de suivi, consultable à tout moment depuis ton compte.",
  },
];

export default function CommentCaMarchePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-8 py-20">
      <div className="flex flex-col gap-3 text-center">
        <span className="text-sm font-bold uppercase tracking-[2px] text-accent-pink">Le process</span>
        <h1 className="font-display text-4xl">Du configurateur à la livraison</h1>
      </div>

      <div className="flex flex-col gap-6">
        {ETAPES.map((etape) => (
          <div key={etape.titre} className="border-l-4 border-accent-teal bg-base-800 p-6">
            <h2 className="font-display text-xl">{etape.titre}</h2>
            <p className="mt-2 text-[15px] text-ink-muted">{etape.texte}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button href="/devis" variant="pink">
          Démarrer ma demande de devis
        </Button>
      </div>
    </div>
  );
}
