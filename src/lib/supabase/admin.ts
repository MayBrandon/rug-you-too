import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Client Supabase avec la clé service_role : CONTOURNE la RLS.
 *
 * Réservé aux traitements serveur de confiance qui ne peuvent pas passer
 * par la session utilisateur : webhook Stripe, tâches admin ponctuelles,
 * jobs planifiés. Ne JAMAIS importer ce fichier depuis un Client Component
 * ni exposer son contenu au navigateur (le `import "server-only"` fait
 * échouer le build si c'est le cas).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
