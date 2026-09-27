# Rug You Too

Site e-commerce de tapis personnalisés (voiture, sol, mur, bureau). Configurateur +
upload de design → demande de devis → validation par l'admin → paiement Stripe →
suivi de commande.

Stack : **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase**.
Projet Supabase dédié, séparé de celui d'Atelier Brillance / DreamWash80.

## Structure du projet

```
src/
├── app/
│   ├── (marketing)/           # Pages vitrine par catégorie — /voiture, /sol, /mur, /bureau
│   ├── comment-ca-marche/     # Page process
│   ├── configurateur/[categorie]/  # Le configurateur (taille, forme, couleur, matière, upload)
│   ├── devis/                 # Formulaire de demande + suivi d'un devis (/devis/[id])
│   ├── compte/                # Espace client connecté (protégé par middleware + layout)
│   ├── admin/                 # Back-office Brandon (protégé, role = 'admin')
│   ├── auth/                  # Connexion, inscription, callback Supabase
│   └── api/
│       ├── devis/             # POST — création d'une demande de devis
│       ├── upload/            # POST — upload des fichiers de personnalisation
│       └── stripe/            # Création de lien de paiement + webhook de confirmation
│
├── components/
│   ├── ui/                    # Atomes réutilisables (Button, Input, Badge…)
│   ├── layout/                # Header, Footer
│   ├── marketing/              # Hero, CategoryGrid, ProcessSteps, Testimonials…
│   ├── configurateur/          # Étapes du configurateur
│   ├── devis/                  # Formulaire, badges de statut, timeline
│   └── admin/                  # Tableaux et actions du back-office
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Client navigateur (Client Components)
│   │   ├── server.ts           # Client serveur (Server Components / Route Handlers), soumis à la RLS
│   │   ├── admin.ts            # Client service_role — contourne la RLS, réservé au serveur de confiance
│   │   └── middleware.ts       # Rafraîchit la session à chaque requête
│   ├── validations/             # Schémas Zod (source unique de vérité pour la validation)
│   └── constants.ts
│
├── types/database.types.ts     # Types générés depuis Supabase (placeholder en attendant le vrai projet)
└── middleware.ts                # Protège /compte et /admin

supabase/migrations/             # Schéma SQL, dans l'ordre d'application
```

## Modèle de données (voir `supabase/migrations/`)

- **profiles** — un par utilisateur Supabase Auth, porte le rôle (`client` / `admin`)
- **produits** / **options_configuration** — catalogue et options du configurateur, éditables depuis l'admin sans redéploiement
- **demandes_devis** — cœur du parcours : la config choisie, les fichiers uploadés, le statut (`nouvelle` → `en_etude` → `devis_envoye` → `accepte`/`refuse`)
- **commandes** — créée quand un devis est accepté ; suit le paiement Stripe puis la production/expédition
- **storage `devis-uploads`** — fichiers de personnalisation (logo/photo), un dossier par client, policies RLS strictes

Toutes les tables ont la RLS activée : un client ne voit/modifie que ses propres
données, un admin (vérifié via `profiles.role`, jamais via une valeur du client) voit tout.

## Parcours client

1. Configurateur (taille/forme/couleur/matière) + upload optionnel d'un design
2. Envoi → `POST /api/devis` → statut `nouvelle`
3. Brandon étudie et fixe un prix depuis `/admin` → statut `devis_envoye`
4. Client accepte/refuse depuis `/devis/[id]`
5. Si accepté → lien de paiement Stripe généré → commande créée
6. Webhook Stripe confirme le paiement → statut `payee` → suivi production/expédition

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # renseigner les clés Supabase + Stripe du projet dédié
npm run dev
```

Les migrations SQL s'appliquent avec la CLI Supabase (`supabase db push`) une fois
le projet créé, ou en les collant dans l'éditeur SQL du dashboard Supabase.

## Ce qui reste à construire (prochaine étape)

- Composants du configurateur (étapes, aperçu prix en direct, upload)
- Formulaire de demande de devis (`react-hook-form` + le schéma Zod déjà prêt)
- Pages admin détaillées (étude d'une demande, fixation du prix, gestion catalogue)
- Espace client (historique commandes, suivi)
- Sections marketing restantes (process, réalisations, témoignages, CTA) — même
  découpage que la maquette, à traduire en composants comme `Hero`/`CategoryGrid`
