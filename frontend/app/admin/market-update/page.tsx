import type { Metadata } from "next";
import { PostsAdmin } from "../../components/admin/posts";

export const metadata: Metadata = { title: "Market Update" };

export default function Page() {
  return <PostsAdmin type="market_update" />;
}
