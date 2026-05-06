import { AppTheme } from "@/app/components/AppTheme";
import { AdminNav } from "./components/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppTheme>
      <AdminNav />
      {children}
    </AppTheme>
  );
}
