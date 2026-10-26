import type { Metadata } from "next";
import { Dashboard } from "../components/admin/Dashboard";

// A page doesn't use its own layout's title template, so the suffix is spelled out here.
export const metadata: Metadata = { title: { absolute: "Dashboard | Planit admin" } };

export default function Page() {
  return <Dashboard />;
}
