import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Protège /compte (client connecté) et /admin (rôle admin, vérifié en base
 * via la table profiles — voir supabase/migrations/0001_init.sql).
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isCompte = path.startsWith("/compte");
  const isAdmin = path.startsWith("/admin");

  if ((isCompte || isAdmin) && !user) {
    const redirectUrl = new URL("/auth/connexion", request.url);
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Le contrôle fin du rôle admin (profiles.role === 'admin') se fait en plus
  // dans src/app/admin/layout.tsx, où on a accès à un client Supabase complet
  // pour requêter la table profiles — le middleware reste volontairement léger.

  return response;
}

export const config = {
  matcher: ["/compte/:path*", "/admin/:path*"],
};
