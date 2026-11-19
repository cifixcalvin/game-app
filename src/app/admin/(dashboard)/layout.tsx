import { AdminShell } from "@/components/admin/admin-shell";
import { requireSession } from "@/lib/auth";
import { getAdminTournamentStats } from "@/lib/tournaments";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: LayoutProps<"/admin">) {
  const user = await requireSession();
  const stats = await getAdminTournamentStats();

  return (
    <AdminShell user={user} pending={stats.pending}>
      {children}
    </AdminShell>
  );
}
