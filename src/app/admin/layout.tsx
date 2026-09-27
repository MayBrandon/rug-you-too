import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const NAV_ADMIN = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/demandes", label: "Demandes" },
  { href: "/admin/produits", label: "Catalogue" },
  { href: "/admin/commandes", label: "Commandes" },
];

/**
 * Le middleware (src/middleware.ts) vérifie déjà qu'un utilisateur est
 * connecté avant d'arriver ici. Ce layout ajoute le contrôle métier :
 * seul un profil avec role = 'admin' peut voir /admin/*.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/connexion?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-8 px-8 py-10">
      <aside className="w-56 shrink-0">
        <nav className="flex flex-col gap-1">
          {NAV_ADMIN.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-ink-faint transition-colors hover:bg-base-800 hover:text-ink-light"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
