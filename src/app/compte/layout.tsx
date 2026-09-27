import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CompteLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/connexion?next=/compte");

  return <div className="mx-auto max-w-4xl px-8 py-12">{children}</div>;
}
