import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "FENIX Admin", robots: { index: false } };

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminShell />
    </AdminGuard>
  );
}
