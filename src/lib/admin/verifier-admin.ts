import { createClient } from "@/lib/supabase/server";

/**
 * Vérifie que l'utilisateur courant est un admin avant d'autoriser une route
 * API sensible. Toute la vérification du rôle se fait ici, côté serveur —
 * jamais côté client, qui ne pourrait pas se contourner pour s'auto-attribuer
 * le rôle admin. Réutilisé par toutes les routes /api/admin/*.
 */
export async function verifierAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, status: 401, error: "Non authentifié" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    return { ok: false as const, status: 403, error: "Accès réservé à l'administration" };
  }

  return { ok: true as const, supabase };
}
