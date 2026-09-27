import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fixerDevisSchema } from "@/lib/validations/admin";

async function verifierAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, status: 401, error: "Non authentifié" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") return { ok: false as const, status: 403, error: "Accès réservé à l'administration" };

  return { ok: true as const, supabase };
}

/**
 * PATCH /api/admin/devis/[id]
 * Fixe le prix + délai d'une demande et bascule son statut sur "devis_envoye".
 * Toute la vérification du rôle admin se fait ici, jamais côté client — le
 * formulaire (src/components/admin/FixerDevisForm.tsx) ne fait qu'appeler
 * cette route, il ne pourrait pas la contourner pour s'auto-attribuer le rôle.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const check = await verifierAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const parsed = fixerDevisSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { prixPropose, delaiEstimeJours, noteAdmin } = parsed.data;

  const { data, error } = await check.supabase
    .from("demandes_devis")
    .update({
      prix_propose: prixPropose,
      delai_estime_jours: delaiEstimeJours ?? null,
      note_admin: noteAdmin ?? null,
      statut: "devis_envoye",
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // TODO: notifier le client (email/push) que son devis est prêt.

  return NextResponse.json({ demande: data });
}

/**
 * Passer une demande en "en_etude" (Brandon l'a prise en charge) sans encore
 * fixer de prix — évite qu'elle reste indéfiniment sur "nouvelle".
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const check = await verifierAdmin();
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { error } = await check.supabase
    .from("demandes_devis")
    .update({ statut: "en_etude" })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
