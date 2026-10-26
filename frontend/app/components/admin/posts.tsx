"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, ExternalLinkIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminApi,
  adminKeys,
  type AdminPost,
  type PostInput,
  type PostStatus,
  type PostType,
} from "@/lib/admin-api";
import { placeFieldErrors, SelectField, TextAreaField, TextField } from "./fields";
import { Callout, ConfirmButton, EmptyState, formatShortDate, PageHeader, PaginationBar, QueryState, useSave } from "./ui";

const POST_TYPES = {
  blog: {
    title: "Blog posts",
    noun: "post",
    adminPath: "/admin/blog",
    publicPath: "/blog",
    intro: "Articles for the Blog page. Drafts are only visible here.",
  },
  market_update: {
    title: "Market Update",
    noun: "update",
    adminPath: "/admin/market-update",
    publicPath: "/market-update",
    intro: "Regular market commentary. The Market Update page and its menu link appear once the first update is published.",
  },
} satisfies Record<PostType, unknown>;

type StatusFilter = PostStatus | "all";

export function PostsAdmin({ type }: { type: PostType }) {
  const config = POST_TYPES[type];
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");

  const query = { page, type, status: status === "all" ? null : status, search };
  const posts = useQuery({
    queryKey: [...adminKeys.posts, query],
    queryFn: () => adminApi.posts(query),
    placeholderData: keepPreviousData,
  });

  const remove = useSave({
    mutationFn: adminApi.deletePost,
    invalidate: [adminKeys.posts],
    onSuccess: () => posts.data?.posts.length === 1 && page > 1 && setPage(page - 1),
  });

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.intro}
        actions={
          <Link href={`${config.adminPath}/new`} className={buttonVariants()}>
            <PlusIcon data-icon="inline-start" /> New {config.noun}
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={status}
          onValueChange={(value) => {
            setStatus(value as StatusFilter);
            setPage(1);
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
        <form
          role="search"
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(draftSearch.trim());
            setPage(1);
          }}
        >
          <Input
            type="search"
            aria-label={`Search ${config.title.toLowerCase()}`}
            placeholder="Search titles"
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
            className="sm:w-56"
          />
          <Button type="submit" variant="outline" size="icon" aria-label="Search">
            <SearchIcon />
          </Button>
        </form>
      </div>

      <QueryState isPending={posts.isPending} error={posts.error} onRetry={() => posts.refetch()}>
        {posts.data && posts.data.posts.length === 0 ? (
          <EmptyState title={search ? "Nothing matches that search" : `No ${config.noun}s yet`}>
            {!search && `Create your first ${config.noun} with “New ${config.noun}”.`}
          </EmptyState>
        ) : (
          posts.data && (
            <div className="rounded-xl bg-card ring-1 ring-foreground/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.data.posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-[16rem] whitespace-normal">
                        <Link href={`${config.adminPath}/${post.id}`} className="font-medium hover:underline">
                          {post.title}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{post.category?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={post.status === "published" ? "default" : "secondary"}>
                          {post.status === "published" ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                        {formatShortDate(post.published_at ?? post.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {post.status === "published" && (
                            <a
                              href={`${config.publicPath}/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                              aria-label={`View “${post.title}” on the website`}
                            >
                              <ExternalLinkIcon />
                            </a>
                          )}
                          <Link
                            href={`${config.adminPath}/${post.id}`}
                            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                            aria-label={`Edit “${post.title}”`}
                          >
                            <PencilIcon />
                          </Link>
                          <ConfirmButton
                            label={<Trash2Icon />}
                            ariaLabel={`Delete “${post.title}”`}
                            size="icon-sm"
                            variant="ghost"
                            title={`Delete this ${config.noun}?`}
                            description={`“${post.title}” will be removed from the website. This can't be undone.`}
                            pending={remove.isPending}
                            onConfirm={() => remove.mutateAsync(post.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        )}
        {posts.data && <PaginationBar meta={posts.data.meta} onPage={setPage} />}
      </QueryState>
    </>
  );
}

type PostFormValues = {
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  status: PostStatus;
  category_id: string | null;
  tags: string;
};

const toFormValues = (post: AdminPost | undefined): PostFormValues => ({
  title: post?.title ?? "",
  excerpt: post?.excerpt ?? "",
  content: post?.content ?? "",
  cover_image_url: post?.cover_image_url ?? "",
  status: post?.status ?? "draft",
  category_id: post?.category ? String(post.category.id) : null,
  tags: post?.tags.map((tag) => tag.name).join(", ") ?? "",
});

/** New post when `id` is missing, otherwise loads and edits that post. */
export function PostEditor({ type, id }: { type: PostType; id?: number }) {
  const config = POST_TYPES[type];
  const post = useQuery({
    queryKey: adminKeys.post(id ?? 0),
    queryFn: () => adminApi.post(id!),
    enabled: id !== undefined,
  });

  return (
    <>
      <Link
        href={config.adminPath}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden /> {config.title}
      </Link>
      {id === undefined ? (
        <PostForm type={type} />
      ) : (
        <QueryState isPending={post.isPending} error={post.error} onRetry={() => post.refetch()}>
          {/* Keyed so the form resets if another post is opened in the same view. */}
          {post.data && <PostForm key={post.data.id} type={type} post={post.data} />}
        </QueryState>
      )}
    </>
  );
}

function PostForm({ type, post }: { type: PostType; post?: AdminPost }) {
  const config = POST_TYPES[type];
  const router = useRouter();
  const categories = useQuery({ queryKey: adminKeys.categories, queryFn: adminApi.categories });
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<PostFormValues>({ defaultValues: toFormValues(post) });

  const save = useSave({
    mutationFn: (input: PostInput) => (post ? adminApi.updatePost(post.id, input) : adminApi.createPost(input)),
    invalidate: post ? [adminKeys.posts, adminKeys.post(post.id)] : [adminKeys.posts],
    onSuccess: (data) => {
      if (post) reset(toFormValues(data.post));
      else router.replace(`${config.adminPath}/${data.post.id}`);
    },
    onError: (error) => placeFieldErrors(error, setError),
  });

  const remove = useSave({
    mutationFn: adminApi.deletePost,
    invalidate: [adminKeys.posts],
    onSuccess: () => router.replace(config.adminPath),
  });

  const onSubmit = handleSubmit((values) =>
    save.mutate({
      title: values.title.trim(),
      excerpt: values.excerpt.trim() || null,
      content: values.content,
      cover_image_url: values.cover_image_url.trim() || null,
      status: values.status,
      post_type: type,
      category_id: values.category_id ? Number(values.category_id) : null,
      tag_names: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }),
  );

  const categoryOptions = [
    { value: "", label: "No category" },
    ...(categories.data ?? []).map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <>
      <PageHeader
        title={post ? `Edit ${config.noun}` : `New ${config.noun}`}
        actions={
          post?.status === "published" && (
            <a
              href={`${config.publicPath}/${post.slug}`}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <ExternalLinkIcon data-icon="inline-start" /> View on website
            </a>
          )
        }
      />

      <Callout tone="warning">
        <p>
          Keep it educational and factual. Don&apos;t promise or predict returns, and don&apos;t present a scheme as a
          recommendation. A disclaimer is added under every {config.noun} automatically
          {type === "market_update" ? ", including that past performance does not indicate future returns" : ""}.
        </p>
      </Callout>

      <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <Card>
          <CardContent className="space-y-5">
            <TextField
              label="Title"
              registration={register("title", {
                required: "Enter a title.",
                minLength: { value: 3, message: "Use at least 3 characters." },
              })}
              error={errors.title?.message}
              maxLength={200}
            />
            <TextAreaField
              label="Summary"
              optional
              hint="One or two sentences shown on the list page and under the title. Up to 500 characters."
              registration={register("excerpt")}
              error={errors.excerpt?.message}
              maxLength={500}
              rows={3}
            />
            <TextAreaField
              label="Content"
              hint="Plain text. Leave a blank line between paragraphs."
              registration={register("content", { required: "Write the content." })}
              error={errors.content?.message}
              rows={18}
              className="[&_textarea]:font-mono [&_textarea]:text-[13px]"
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-5">
              <SelectField
                label="Status"
                control={control}
                name="status"
                options={[
                  { value: "draft", label: "Draft (hidden)" },
                  { value: "published", label: "Published" },
                ]}
              />
              <SelectField
                label="Category"
                control={control}
                name="category_id"
                options={categoryOptions}
                placeholder="No category"
                error={errors.category_id?.message}
                hint={
                  <>
                    <Link href="/admin/categories">Manage categories</Link>
                  </>
                }
              />
              <TextField
                label="Tags"
                optional
                hint="Separate with commas, e.g. SIP, Tax saving"
                registration={register("tags")}
                error={errors.tags?.message}
              />
              <TextField
                label="Cover image URL"
                optional
                type="url"
                placeholder="https://…"
                registration={register("cover_image_url")}
                error={errors.cover_image_url?.message}
              />
              <Button type="submit" className="w-full" disabled={save.isPending || (!!post && !isDirty)}>
                {save.isPending ? "Saving…" : post ? "Save changes" : `Create ${config.noun}`}
              </Button>
            </CardContent>
          </Card>
          {post && (
            <ConfirmButton
              label={
                <>
                  <Trash2Icon data-icon="inline-start" /> Delete {config.noun}
                </>
              }
              size="default"
              title={`Delete this ${config.noun}?`}
              description={`“${post.title}” will be removed from the website. This can't be undone.`}
              pending={remove.isPending}
              onConfirm={() => remove.mutateAsync(post.id)}
            />
          )}
        </div>
      </form>
    </>
  );
}
