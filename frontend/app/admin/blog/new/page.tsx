import type { Metadata } from "next";
import { PostEditor } from "../../../components/admin/posts";

export const metadata: Metadata = { title: "New blog post" };

export default function Page() {
  return <PostEditor type="blog" />;
}
