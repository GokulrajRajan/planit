"use client";

import { useQuery } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminApi, adminKeys } from "@/lib/admin-api";
import type { Category } from "@/lib/site-data";
import { placeFieldErrors, TextField } from "./fields";
import { ConfirmButton, EmptyState, PageHeader, QueryState, useSave } from "./ui";

const nameRules = {
  required: "Enter a name.",
  minLength: { value: 2, message: "Use at least 2 characters." },
  maxLength: { value: 100, message: "Use 100 characters or fewer." },
};

export function CategoriesAdmin() {
  const categories = useQuery({ queryKey: adminKeys.categories, queryFn: adminApi.categories });
  const [editing, setEditing] = useState<Category | null>(null);

  const { register, handleSubmit, setError, reset, formState: { errors } } = useForm<{ name: string }>();
  const create = useSave({
    mutationFn: (name: string) => adminApi.createCategory(name),
    invalidate: [adminKeys.categories],
    onSuccess: () => reset({ name: "" }),
    onError: (error) => placeFieldErrors(error, setError),
  });
  // Posts show their category, so the lists refresh too.
  const remove = useSave({ mutationFn: adminApi.deleteCategory, invalidate: [adminKeys.categories, adminKeys.posts] });

  return (
    <>
      <PageHeader
        title="Categories"
        description="Topics for blog posts and market updates. Visitors can filter the Blog page by category."
      />

      <form
        onSubmit={handleSubmit((values) => create.mutate(values.name.trim()))}
        noValidate
        className="mb-6 flex max-w-lg items-start gap-2"
      >
        <TextField
          label="New category"
          placeholder="e.g. Tax planning"
          registration={register("name", nameRules)}
          error={errors.name?.message}
          className="flex-1"
        />
        <Button type="submit" className="mt-[1.375rem]" disabled={create.isPending}>
          <PlusIcon data-icon="inline-start" /> Add
        </Button>
      </form>

      <QueryState isPending={categories.isPending} error={categories.error} onRetry={() => categories.refetch()}>
        {categories.data?.length === 0 ? (
          <EmptyState title="No categories yet">Add one above, then pick it when writing a post.</EmptyState>
        ) : (
          <ul className="divide-y rounded-xl bg-card ring-1 ring-foreground/10">
            {categories.data?.map((category) => (
              <li key={category.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="font-medium">{category.name}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Rename ${category.name}`}
                    onClick={() => setEditing(category)}
                  >
                    <PencilIcon />
                  </Button>
                  <ConfirmButton
                    label={<Trash2Icon />}
                    ariaLabel={`Delete ${category.name}`}
                    size="icon-sm"
                    variant="ghost"
                    title="Delete this category?"
                    description={`Posts in “${category.name}” will stay published, just without a category.`}
                    pending={remove.isPending}
                    onConfirm={() => remove.mutateAsync(category.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </QueryState>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          {editing && <RenameForm key={editing.id} category={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function RenameForm({ category, onDone }: { category: Category; onDone: () => void }) {
  const { register, handleSubmit, setError, formState: { errors } } = useForm({ defaultValues: { name: category.name } });
  const rename = useSave({
    mutationFn: (name: string) => adminApi.updateCategory(category.id, name),
    invalidate: [adminKeys.categories, adminKeys.posts],
    onSuccess: onDone,
    onError: (error) => placeFieldErrors(error, setError),
  });

  return (
    <form onSubmit={handleSubmit((values) => rename.mutate(values.name.trim()))} noValidate className="space-y-4">
      <DialogHeader>
        <DialogTitle>Rename category</DialogTitle>
      </DialogHeader>
      <TextField label="Name" registration={register("name", nameRules)} error={errors.name?.message} autoFocus />
      <DialogFooter>
        <Button type="submit" disabled={rename.isPending}>
          {rename.isPending ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
