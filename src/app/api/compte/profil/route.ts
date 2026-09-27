import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profilUpdateSchema } from "@/lib/validations/compte";

/**
 * PATCH /api/compte/profil
 * Un client modifie ses propres coordonnées. La RLS ("Un utilisateur modifie
 * son propre profil", 0001_init.sql) empêche déjà de toucher au profil d'un
 * autre, mais on vérifie aussi l'authentification ici pour un message clair.
 */
export async function PATCH(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const parsed = profilUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { nomComplet, telephone } = parsed.data;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...(nomComplet !== undefined ? { nom_complet: nomComplet } : {}),
      ...(telephone !== undefined ? { telephone } : {}),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profile: data });
}
