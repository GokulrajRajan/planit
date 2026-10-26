"use client";

import { useQuery } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { adminApi, adminKeys, type AdminTeamMember, type TeamMemberInput } from "@/lib/admin-api";
import { nullIfEmpty, placeFieldErrors, SwitchField, TextAreaField, TextField } from "./fields";
import { Callout, ConfirmButton, EmptyState, PageHeader, QueryState, useSave } from "./ui";

export function TeamAdmin() {
  const team = useQuery({ queryKey: adminKeys.team, queryFn: adminApi.team });
  const [editing, setEditing] = useState<AdminTeamMember | "new" | null>(null);

  const toggle = useSave({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) => adminApi.updateTeamMember(id, { visible }),
    invalidate: [adminKeys.team, adminKeys.settings],
  });
  const remove = useSave({ mutationFn: adminApi.deleteTeamMember, invalidate: [adminKeys.team, adminKeys.settings] });

  return (
    <>
      <PageHeader
        title="Team"
        description="People shown on the About → Our Team page, in the order set here. The page stays hidden until at least one member is visible."
        actions={
          <Button onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" /> Add member
          </Button>
        }
      />
      <Callout>
        <p>Only list real people who work with Planit, with qualifications they actually hold.</p>
      </Callout>

      <QueryState isPending={team.isPending} error={team.error} onRetry={() => team.refetch()}>
        {team.data?.length === 0 ? (
          <EmptyState title="No team members yet" />
        ) : (
          <ul className="divide-y rounded-xl bg-card ring-1 ring-foreground/10">
            {team.data?.map((member) => (
              <li key={member.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                {member.photo_url ? (
                  // Photos can be hosted anywhere the admin chooses, which next/image would need configured.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photo_url} alt="" className="size-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted font-medium" aria-hidden>
                    {member.name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{member.name}</p>
                  <p className="truncate text-muted-foreground">{member.designation ?? "—"}</p>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  Order {member.sort_order}
                </Badge>
                <Switch
                  checked={member.visible}
                  onCheckedChange={(visible) => toggle.mutate({ id: member.id, visible })}
                  aria-label={`Show ${member.name} on the website`}
                />
                <Button variant="ghost" size="icon-sm" aria-label={`Edit ${member.name}`} onClick={() => setEditing(member)}>
                  <PencilIcon />
                </Button>
                <ConfirmButton
                  label={<Trash2Icon />}
                  ariaLabel={`Remove ${member.name}`}
                  size="icon-sm"
                  variant="ghost"
                  title="Remove this team member?"
                  description={`${member.name} will be removed from the website. To hide them for now, switch them off instead.`}
                  confirmLabel="Remove"
                  pending={remove.isPending}
                  onConfirm={() => remove.mutateAsync(member.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </QueryState>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          {editing && (
            <MemberForm
              key={editing === "new" ? "new" : editing.id}
              member={editing === "new" ? null : editing}
              nextOrder={(team.data?.length ?? 0) + 1}
              onDone={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type FormValues = Omit<TeamMemberInput, "designation" | "qualifications" | "bio" | "photo_url" | "linkedin_url"> & {
  designation: string;
  qualifications: string;
  bio: string;
  photo_url: string;
  linkedin_url: string;
};

function MemberForm({
  member,
  nextOrder,
  onDone,
}: {
  member: AdminTeamMember | null;
  nextOrder: number;
  onDone: () => void;
}) {
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: member?.name ?? "",
      designation: member?.designation ?? "",
      qualifications: member?.qualifications ?? "",
      bio: member?.bio ?? "",
      photo_url: member?.photo_url ?? "",
      linkedin_url: member?.linkedin_url ?? "",
      sort_order: member?.sort_order ?? nextOrder,
      visible: member?.visible ?? true,
    },
  });

  const save = useSave({
    mutationFn: (input: TeamMemberInput) =>
      member ? adminApi.updateTeamMember(member.id, input) : adminApi.createTeamMember(input),
    invalidate: [adminKeys.team, adminKeys.settings],
    onSuccess: onDone,
    onError: (error) => placeFieldErrors(error, setError),
  });

  return (
    <form onSubmit={handleSubmit((values) => save.mutate(nullIfEmpty(values)))} noValidate className="space-y-4">
      <DialogHeader>
        <DialogTitle>{member ? "Edit team member" : "Add team member"}</DialogTitle>
      </DialogHeader>
      <TextField
        label="Name"
        registration={register("name", { required: "Enter their name." })}
        error={errors.name?.message}
        maxLength={120}
      />
      <TextField label="Designation" optional placeholder="e.g. Founder & Mutual Fund Distributor" registration={register("designation")} error={errors.designation?.message} maxLength={120} />
      <TextField label="Qualifications" optional placeholder="e.g. NISM Series V-A certified" registration={register("qualifications")} error={errors.qualifications?.message} maxLength={200} />
      <TextAreaField label="Short bio" optional registration={register("bio")} error={errors.bio?.message} rows={4} maxLength={2000} />
      <TextField label="Photo URL" optional hint="A square photo works best." registration={register("photo_url")} error={errors.photo_url?.message} />
      <TextField label="LinkedIn URL" optional type="url" placeholder="https://www.linkedin.com/in/…" registration={register("linkedin_url")} error={errors.linkedin_url?.message} />
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
