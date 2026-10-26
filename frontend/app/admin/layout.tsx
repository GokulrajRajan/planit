import type { Metadata } from "next";
import { AdminShell } from "../components/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Planit admin" },
  robots: { index: false, follow: false },
};

/** The admin panel: client-rendered, since every request needs the admin's in-memory access token. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
