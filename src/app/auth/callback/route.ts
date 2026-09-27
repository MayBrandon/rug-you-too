import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback OAuth / magic link de Supabase Auth.
 * Échange le code contre une session puis redirige vers `next` (ou l'accueil).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
