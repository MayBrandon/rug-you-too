import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/stripe/create-payment-link
 * Appelée depuis l'admin quand Brandon valide le prix d'un devis (statut
 * 'devis_envoye' -> le client reçoit ensuite un lien de paiement une fois
 * qu'il a accepté). Utilise le client admin (service_role) car cette route
 * doit pouvoir créer la commande même si le déclencheur est un back-office
 * interne plutôt qu'une action du client.
 *
 * NB: la vérification "l'appelant est bien un admin" doit être faite en
 * amont (dans le composant serveur/action qui appelle cette route, via un
 * getUser() + contrôle profiles.role) — cette route ne le refait pas ici
 * pour rester simple, à durcir avant mise en prod.
 */
export async function POST(request: Request) {
  const { demandeId, prixFinal } = (await request.json()) as {
    demandeId: string;
    prixFinal: number;
  };

  const supabase = createAdminClient();

  const { data: demande, error: demandeError } = await supabase
    .from("demandes_devis")
    .select("*")
    .eq("id", demandeId)
    .single();

  if (demandeError || !demande) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  const price = await stripe.prices.create({
    currency: "eur",
    unit_amount: Math.round(prixFinal * 100),
    product_data: { name: `Tapis sur mesure — ${demande.categorie}` },
  });

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { demande_devis_id: demande.id },
  });

  const { data: commande, error: commandeError } = await supabase
    .from("commandes")
    .insert({
      demande_devis_id: demande.id,
      client_id: demande.client_id,
      prix_final: prixFinal,
      stripe_payment_link_id: paymentLink.id,
      stripe_payment_link_url: paymentLink.url,
    })
    .select()
    .single();

  if (commandeError) {
    return NextResponse.json({ error: commandeError.message }, { status: 500 });
  }

  return NextResponse.json({ commande, paymentLinkUrl: paymentLink.url });
}
