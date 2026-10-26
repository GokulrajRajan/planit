import type { Metadata } from "next";
import { EnquiriesAdmin } from "../../components/admin/EnquiriesAdmin";

export const metadata: Metadata = { title: "Enquiries" };

export default function Page() {
  return <EnquiriesAdmin />;
}
