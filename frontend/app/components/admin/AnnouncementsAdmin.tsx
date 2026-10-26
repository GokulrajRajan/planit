"use client";

import { useQuery } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi, adminKeys, type AdminAnnouncement, type AnnouncementInput } from "@/lib/admin-api";
import { placeFieldErrors, SelectField, SwitchField, TextAreaField, TextField } from "./fields";
import { ConfirmButton, EmptyState, formatDateTime, PageHeader, QueryState, useSave } from "./ui";

type Placement = AdminAnnouncement["placement"];

const PLACEMENTS: Record<Placement, { label: string; where: string }> = {
  announcement_bar: {
    label: "Announcement bar",
    where: "A thin strip above the header on every page. Only the newest live one is shown.",
  },
  banner: { label: "Banners", where: "A highlighted strip on the home page, just below the hero. Only the newest live one is shown." },
  notice: { label: "Notices", where: "Listed under “Notices” on the Investor Help Desk page, newest first." },
};

function statusOf(item: AdminAnnouncement, now: number) {
  if (!item.active) return { label: "Off", variant: "outline" } as const;
  if (item.ends_at && Date.parse(item.ends_at) <= now) return { label: "Ended", variant: "outline" } as const;
  if (item.starts_at && Date.parse(item.starts_at) > now) return { label: "Scheduled", variant: "secondary" } as const;
  return { label: "Live", variant: "default" } as const;
}

export function AnnouncementsAdmin() {
  const [placement, setPlacement] = useState<Placement>("announcement_bar");
  const [editing, setEditing] = useState<AdminAnnouncement | "new" | null>(null);
  const announcements = useQuery({ queryKey: adminKeys.announcements, queryFn: adminApi.announcements });

  const toggle = useSave({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => adminApi.updateAnnouncement(id, { active }),
    invalidate: [adminKeys.announcements, adminKeys.settings],
  });
  const remove = useSave({
    mutationFn: adminApi.deleteAnnouncement,
    invalidate: [adminKeys.announcements, adminKeys.settings],
  });

  const items = announcements.data?.filter((a) => a.placement === placement) ?? [];
  // Statuses are worked out as of the last fetch, which refreshes whenever the page regains focus.
  const now = announcements.dataUpdatedAt;

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Short messages for visitors: the announcement bar, home page banners and investor notices. Schedule them with optional start and end times."
        actions={
          <Button onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" /> New announcement
          </Button>
        }
      />

      <Tabs value={placement} onValueChange={(value) => setPlacement(value as Placement)} className="mb-2">
        <TabsList>
          {(Object.keys(PLACEMENTS) as Placement[]).map((key) => (
            <TabsTrigger key={key} value={key}>
              {PLACEMENTS[key].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <p className="mb-4 text-sm text-muted-foreground">{PLACEMENTS[placement].where}</p>

      <QueryState isPending={announcements.isPending} error={announcements.error} onRetry={() => announcements.refetch()}>
        {items.length === 0 ? (
          <EmptyState title={`No ${PLACEMENTS[placement].label.toLowerCase()} yet`}>
            Nothing shows in this spot until you add one.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const status = statusOf(item, now);
              return (
                <li key={item.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-sm font-medium">{item.text}</p>
                      {item.link && <p className="truncate text-xs text-muted-foreground">Links to {item.link}</p>}
                      {(item.starts_at || item.ends_at) && (
                        <p className="text-xs text-muted-foreground">
                          {item.starts_at ? `From ${formatDateTime(item.starts_at)}` : "From now"}
                          {item.ends_at ? ` until ${formatDateTime(item.ends_at)}` : " with no end date"}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Switch
                        checked={item.active}
                        onCheckedChange={(active) => toggle.mutate({ id: item.id, active })}
                        aria-label={item.active ? "Switch off" : "Switch on"}
                      />
                      <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(item)}>
                        <PencilIcon />
                      </Button>
                      <ConfirmButton
                        label={<Trash2Icon />}
                        ariaLabel="Delete"
                        size="icon-sm"
                        variant="ghost"
                        title="Delete this announcement?"
                        description="It will be removed from the website straight away."
                        pending={remove.isPending}
                        onConfirm={() => remove.mutateAsync(item.id)}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </QueryState>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          {editing && (
            <AnnouncementForm
              key={editing === "new" ? "new" : editing.id}
              announcement={editing === "new" ? null : editing}
              defaultPlacement={placement}
              onDone={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type FormValues = {
  text: string;
  link: string;
  placement: Placement;
  starts_at: string;
  ends_at: string;
  active: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO time → the value a datetime-local input expects, in the admin's own time zone. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** The input's local time → an ISO time with offset, so the server never has to guess the zone. */
const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null);

function AnnouncementForm({
  announcement,
  defaultPlacement,
  onDone,
}: {
  announcement: AdminAnnouncement | null;
  defaultPlacement: Placement;
  onDone: () => void;
}) {
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      text: announcement?.text ?? "",
      link: announcement?.link ?? "",
      placement: announcement?.placement ?? defaultPlacement,
      starts_at: toLocalInput(announcement?.starts_at ?? null),
      ends_at: toLocalInput(announcement?.ends_at ?? null),
      active: announcement?.active ?? true,
    },
  });

  const save = useSave({
    mutationFn: (input: AnnouncementInput) =>
      announcement ? adminApi.updateAnnouncement(announcement.id, input) : adminApi.createAnnouncement(input),
    invalidate: [adminKeys.announcements, adminKeys.settings],
    onSuccess: onDone,
    onError: (error) => placeFieldErrors(error, setError),
  });

  const onSubmit = handleSubmit((values) =>
    save.mutate({
      text: values.text.trim(),
      link: values.link.trim() || null,
      placement: values.placement,
      starts_at: fromLocalInput(values.starts_at),
      ends_at: fromLocalInput(values.ends_at),
      active: values.active,
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <DialogHeader>
        <DialogTitle>{announcement ? "Edit announcement" : "New announcement"}</DialogTitle>
        <DialogDescription>Keep it short and factual. Never mention returns or offers.</DialogDescription>
      </DialogHeader>
      <TextAreaField
        label="Message"
        registration={register("text", { required: "Write the message." })}
        error={errors.text?.message}
        maxLength={300}
        rows={3}
      />
      <TextField
        label="Link"
        optional
        hint="A page on this site (e.g. /contact) or a full https:// address."
        registration={register("link")}
        error={errors.link?.message}
      />
      <SelectField
        label="Where it shows"
        control={control}
        name="placement"
        options={(Object.keys(PLACEMENTS) as Placement[]).map((key) => ({ value: key, label: PLACEMENTS[key].label }))}
        error={errors.placement?.message}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Starts"
          optional
          type="datetime-local"
          registration={register("starts_at")}
          error={errors.starts_at?.message}
        />
        <TextField
          label="Ends"
          optional
          type="datetime-local"
          registration={register("ends_at")}
          error={errors.ends_at?.message}
        />
      </div>
      <SwitchField label="Switched on" hint="Switch off to hide it without deleting it." control={control} name="active" />
      <DialogFooter>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
