import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/stripe/webhook
 * Reçoit les événements Stripe (paiement confirmé) et met à jour la
 * commande correspondante. À déclarer dans le dashboard Stripe avec
 * l'URL publique du site + STRIPE_WEBHOOK_SECRET en variable d'env.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: `Signature invalide: ${err}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "payment_link.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const demandeDevisId = session.metadata?.demande_devis_id;

    if (demandeDevisId) {
      const supabase = createAdminClient();
      await supabase
        .from("commandes")
        .update({
          statut: "payee",
          payee_le: new Date().toISOString(),
          stripe_checkout_session_id: session.id,
        })
        .eq("demande_devis_id", demandeDevisId);

      // TODO: notifier Brandon + le client (email de confirmation).
    }
  }

  return NextResponse.json({ received: true });
}
