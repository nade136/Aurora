import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import AdminInputStyler from "@/components/admin/AdminInputStyler";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="h-screen flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar />
          <Breadcrumbs />
          <main className="flex-1 overflow-auto p-6">
            <AdminInputStyler>{children}</AdminInputStyler>
          </main>
        </div>
      </div>
      <style>{`
        .admin-input-style input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="color"]),
        .admin-input-style textarea {
          font-family: var(--admin-input-font-family, inherit);
          font-size: var(--admin-input-font-size, inherit);
          font-weight: var(--admin-input-font-weight, 400);
          font-style: var(--admin-input-font-style, normal);
          color: var(--admin-input-color, inherit);
        }
      `}</style>
    </div>
  );
}
