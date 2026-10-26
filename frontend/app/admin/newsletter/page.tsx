import type { Metadata } from "next";
import { NewsletterAdmin } from "../../components/admin/NewsletterAdmin";

export const metadata: Metadata = { title: "Newsletter" };

export default function Page() {
  return <NewsletterAdmin />;
}
