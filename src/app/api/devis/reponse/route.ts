import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reponseDevisSchema } from "@/lib/validations/devis";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/devis/reponse
 * Le client accepte ou refuse le devis reçu. Utilise le client "serveur"
 * (soumis à la RLS) pour la mise à jour de sa propre demande — il ne peut
 * pas répondre à la place de quelqu'un d'autre. Si accepté, bascule sur le
 * client admin uniquement pour créer le lien de paiement Stripe + la
 * commande (ces deux écritures ne concernent pas les données du client).
 */
export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const parsed = reponseDevisSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { demandeId, reponse } = parsed.data;

  const { data: demande, error: fetchError } = await supabase
    .from("demandes_devis")
    .select("*")
    .eq("id", demandeId)
    .eq("client_id", user.id)
    .single();

  if (fetchError || !demande) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  if (demande.statut !== "devis_envoye" || demande.prix_propose == null) {
    return NextResponse.json({ error: "Ce devis n'est pas (ou plus) en attente de réponse" }, { status: 409 });
  }

  const { error: updateError } = await supabase
    .from("demandes_devis")
    .update({ statut: reponse })
    .eq("id", demandeId)
    .eq("client_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (reponse === "refuse") {
    return NextResponse.json({ ok: true });
  }

  // reponse === "accepte" -> lien de paiement + commande
  const admin = createAdminClient();

  const price = await stripe.prices.create({
    currency: "eur",
    unit_amount: Math.round(demande.prix_propose * 100),
    product_data: { name: `Tapis sur mesure — ${demande.categorie}` },
  });

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { demande_devis_id: demande.id },
  });

  const { error: commandeError } = await admin.from("commandes").insert({
    demande_devis_id: demande.id,
    client_id: demande.client_id,
    prix_final: demande.prix_propose,
    stripe_payment_link_id: paymentLink.id,
    stripe_payment_link_url: paymentLink.url,
  });

  if (commandeError) {
    return NextResponse.json({ error: commandeError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, paymentLinkUrl: paymentLink.url });
}
