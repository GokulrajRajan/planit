import type { Metadata } from "next";
import { PostsAdmin } from "../../components/admin/posts";

export const metadata: Metadata = { title: "Blog posts" };

export default function Page() {
  return <PostsAdmin type="blog" />;
}
