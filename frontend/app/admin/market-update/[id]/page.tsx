import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostEditor } from "../../../components/admin/posts";

export const metadata: Metadata = { title: "Edit market update" };

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  return <PostEditor type="market_update" id={id} />;
}
