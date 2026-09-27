import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { demandeDevisSchema } from "@/lib/validations/devis";

/**
 * POST /api/devis
 * Crée une demande de devis pour l'utilisateur connecté.
 * Le prix et le statut ne sont jamais fournis par le client : ils restent
 * à 'nouvelle' et null jusqu'à ce qu'un admin les fixe (voir /admin/devis/[id]).
 */
export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = demandeDevisSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { categorie, produitId, configuration, fichiersUrls, messageClient } = parsed.data;

  const { data, error } = await supabase
    .from("demandes_devis")
    .insert({
      client_id: user.id,
      categorie,
      produit_id: produitId ?? null,
      configuration,
      fichiers_urls: fichiersUrls,
      message_client: messageClient ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: notifier Brandon (email ou push — voir /areas/app-routines.md pour
  // le système de notifications déjà en place sur les autres projets).

  return NextResponse.json({ demande: data }, { status: 201 });
}
