import type { Metadata } from "next";
import { AnnouncementsAdmin } from "../../components/admin/AnnouncementsAdmin";

export const metadata: Metadata = { title: "Announcements" };

export default function Page() {
  return <AnnouncementsAdmin />;
}
