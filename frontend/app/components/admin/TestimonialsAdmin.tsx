"use client";

import { useQuery } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { adminApi, adminKeys, type AdminTestimonial, type TestimonialInput } from "@/lib/admin-api";
import { nullIfEmpty, placeFieldErrors, SwitchField, TextAreaField, TextField } from "./fields";
import { Callout, ConfirmButton, EmptyState, PageHeader, QueryState, useSave } from "./ui";

export function TestimonialsAdmin() {
  const testimonials = useQuery({ queryKey: adminKeys.testimonials, queryFn: adminApi.testimonials });
  const [editing, setEditing] = useState<AdminTestimonial | "new" | null>(null);

  const toggle = useSave({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) => adminApi.updateTestimonial(id, { visible }),
    invalidate: [adminKeys.testimonials, adminKeys.settings],
  });
  const remove = useSave({
    mutationFn: adminApi.deleteTestimonial,
    invalidate: [adminKeys.testimonials, adminKeys.settings],
  });

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Client feedback for the home page. The section stays hidden until at least one testimonial is visible."
        actions={
          <Button onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" /> Add testimonial
          </Button>
        }
      />
      <Callout tone="warning">
        <p>
          Only publish genuine feedback from real clients, with their written permission. Testimonials must not mention
          returns, performance or any promise. Check with your compliance adviser before publishing.
        </p>
      </Callout>

      <QueryState isPending={testimonials.isPending} error={testimonials.error} onRetry={() => testimonials.refetch()}>
        {testimonials.data?.length === 0 ? (
          <EmptyState title="No testimonials yet" />
        ) : (
          <ul className="space-y-3">
            {testimonials.data?.map((item) => (
              <li key={item.id} className="flex gap-3 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10">
                <blockquote className="min-w-0 flex-1 space-y-1.5">
                  <p className="line-clamp-3">“{item.content}”</p>
                  <footer className="text-muted-foreground">
                    — {item.author_name}
                    {item.author_detail && `, ${item.author_detail}`}
                  </footer>
                </blockquote>
                <div className="flex shrink-0 items-start gap-1">
                  <Switch
                    checked={item.visible}
                    onCheckedChange={(visible) => toggle.mutate({ id: item.id, visible })}
                    aria-label={`Show the testimonial from ${item.author_name}`}
                    className="mt-1.5 mr-1"
                  />
                  <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(item)}>
                    <PencilIcon />
                  </Button>
                  <ConfirmButton
                    label={<Trash2Icon />}
                    ariaLabel="Delete"
                    size="icon-sm"
                    variant="ghost"
                    title="Delete this testimonial?"
                    description="It will be removed from the website. To hide it for now, switch it off instead."
                    pending={remove.isPending}
                    onConfirm={() => remove.mutateAsync(item.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </QueryState>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          {editing && (
            <TestimonialForm
              key={editing === "new" ? "new" : editing.id}
              testimonial={editing === "new" ? null : editing}
              nextOrder={(testimonials.data?.length ?? 0) + 1}
              onDone={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type FormValues = Omit<TestimonialInput, "author_detail"> & { author_detail: string };

function TestimonialForm({
  testimonial,
  nextOrder,
  onDone,
}: {
  testimonial: AdminTestimonial | null;
  nextOrder: number;
  onDone: () => void;
}) {
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      author_name: testimonial?.author_name ?? "",
      author_detail: testimonial?.author_detail ?? "",
      content: testimonial?.content ?? "",
      sort_order: testimonial?.sort_order ?? nextOrder,
      visible: testimonial?.visible ?? true,
    },
  });

  const save = useSave({
    mutationFn: (input: TestimonialInput) =>
      testimonial ? adminApi.updateTestimonial(testimonial.id, input) : adminApi.createTestimonial(input),
    invalidate: [adminKeys.testimonials, adminKeys.settings],
    onSuccess: onDone,
    onError: (error) => placeFieldErrors(error, setError),
  });

  return (
    <form onSubmit={handleSubmit((values) => save.mutate(nullIfEmpty(values)))} noValidate className="space-y-4">
      <DialogHeader>
        <DialogTitle>{testimonial ? "Edit testimonial" : "Add testimonial"}</DialogTitle>
      </DialogHeader>
      <TextAreaField
        label="Testimonial"
        registration={register("content", { required: "Write the testimonial." })}
        error={errors.content?.message}
        rows={5}
        maxLength={1000}
      />
      <TextField
        label="Client name"
        hint="As the client agreed to be named, e.g. “Priya S.”"
        registration={register("author_name", { required: "Enter the client's name." })}
        error={errors.author_name?.message}
        maxLength={120}
      />
      <TextField
        label="Detail"
        optional
        placeholder="e.g. Teacher, Chennai"
        registration={register("author_detail")}
        error={errors.author_detail?.message}
        maxLength={120}
      />
      <TextField
        label="Order"
        type="number"
        hint="Lower numbers are shown first."
        registration={register("sort_order", { valueAsNumber: true })}
        error={errors.sort_order?.message}
        className="max-w-32"
      />
      <SwitchField label="Show on the website" control={control} name="visible" />
      <DialogFooter>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
