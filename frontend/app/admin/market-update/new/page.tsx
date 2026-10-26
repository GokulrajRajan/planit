import type { Metadata } from "next";
import { PostEditor } from "../../../components/admin/posts";

export const metadata: Metadata = { title: "New market update" };

export default function Page() {
  return <PostEditor type="market_update" />;
}
