"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { get, useFieldArray, useForm, type FieldValues } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi, adminKeys, type SettingsInput } from "@/lib/admin-api";
import { contrastRatio } from "@/lib/brand";
import type { SectionKey, SiteSettings } from "@/lib/site-data";
import { placeFieldErrors, TextAreaField, TextField } from "./fields";
import { SECTION_INFO, SETTINGS_TABS, type SettingsTab } from "./sections";
import { Callout, PageHeader, QueryState, useSave } from "./ui";

export function SettingsAdmin({ initialTab }: { initialTab: SettingsTab }) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const settings = useQuery({ queryKey: adminKeys.settings, queryFn: adminApi.settings });

  return (
    <>
      <PageHeader
        title="Site settings"
        description="The client's details, links and which sections show. Saved changes appear on the website within a minute."
      />
      <QueryState isPending={settings.isPending} error={settings.error} onRetry={() => settings.refetch()}>
        {settings.data && (
          <Tabs value={tab} onValueChange={(value) => setTab(value as SettingsTab)}>
            <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <TabsList>
                {SETTINGS_TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsContent value="branding">
              <BrandingForm settings={settings.data} />
            </TabsContent>
            <TabsContent value="office">
              <GroupForm settings={settings.data} {...OFFICE} />
            </TabsContent>
            <TabsContent value="registration">
              <GroupForm settings={settings.data} {...REGISTRATION} />
            </TabsContent>
            <TabsContent value="grievance">
              <GroupForm settings={settings.data} {...GRIEVANCE} />
            </TabsContent>
            <TabsContent value="links">
              <GroupForm settings={settings.data} {...LINKS} />
            </TabsContent>
            <TabsContent value="stats">
              <StatsForm settings={settings.data} />
            </TabsContent>
            <TabsContent value="sections">
              <SectionToggles settings={settings.data} />
            </TabsContent>
          </Tabs>
        )}
      </QueryState>
    </>
  );
}

type FieldDef = {
  /** Dotted path into the settings, e.g. "office.pincode"; also the name the server reports errors under. */
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "date";
  hint?: React.ReactNode;
  placeholder?: string;
  multiline?: boolean;
  /** Spans both columns on wide screens. */
  wide?: boolean;
};

type GroupConfig = {
  title: string;
  description: React.ReactNode;
  /** The top-level settings keys this form saves. */
  keys: (keyof SettingsInput)[];
  fields: FieldDef[];
  callout?: React.ReactNode;
};

/** null → "" for inputs, recursively. */
function toInputs(value: unknown): unknown {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(toInputs);
  if (typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toInputs(v)]));
  return value;
}

/** "" → null for the API, recursively, so a cleared field is saved as empty. */
function toPayload(value: unknown): unknown {
  if (typeof value === "string") return value.trim() === "" ? null : value.trim();
  if (Array.isArray(value)) return value.map(toPayload);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPayload(v)]));
  return value;
}

const pick = (settings: SiteSettings, keys: (keyof SettingsInput)[]) =>
  toInputs(Object.fromEntries(keys.map((key) => [key, settings[key]]))) as FieldValues;

function useSettingsForm(settings: SiteSettings, keys: (keyof SettingsInput)[]) {
  const form = useForm<FieldValues>({ defaultValues: pick(settings, keys) });
  const save = useSave({
    mutationFn: (values: FieldValues) => adminApi.updateSettings(toPayload(values) as SettingsInput),
    invalidate: [adminKeys.settings],
    onSuccess: (data) => form.reset(pick(data.settings, keys)),
    onError: (error) => placeFieldErrors(error, form.setError),
  });
  return { form, save };
}

function SaveBar({ pending, dirty }: { pending: boolean; dirty: boolean }) {
  return (
    <div className="flex items-center justify-end gap-3 border-t pt-4">
      {dirty && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
      <Button type="submit" disabled={pending || !dirty}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

function GroupForm({ settings, title, description, keys, fields, callout }: GroupConfig & { settings: SiteSettings }) {
  const { form, save } = useSettingsForm(settings, keys);
  const { register, handleSubmit, formState } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {callout && <Callout>{callout}</Callout>}
        <form onSubmit={handleSubmit((values) => save.mutate(values))} noValidate className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((field) => {
              const props = {
                label: field.label,
                optional: true,
                hint: field.hint,
                error: get(formState.errors, field.name)?.message as string | undefined,
                registration: register(field.name),
                placeholder: field.placeholder,
                className: field.wide || field.multiline ? "md:col-span-2" : undefined,
              };
              return field.multiline ? (
                <TextAreaField key={field.name} rows={3} {...props} />
              ) : (
                <TextField key={field.name} type={field.type ?? "text"} {...props} />
              );
            })}
          </div>
          <SaveBar pending={save.isPending} dirty={formState.isDirty} />
        </form>
      </CardContent>
    </Card>
  );
}

const OFFICE: GroupConfig = {
  title: "Office",
  description: "Shown in the footer and on the Contact page. Leave anything you don't have yet empty: it simply won't show.",
  keys: ["office"],
  fields: [
    { name: "office.legal_name", label: "Registered business name", wide: true },
    { name: "office.address_line1", label: "Address line 1" },
    { name: "office.address_line2", label: "Address line 2" },
    { name: "office.city", label: "City" },
    { name: "office.state", label: "State" },
    { name: "office.pincode", label: "PIN code", placeholder: "600001" },
    { name: "office.phone", label: "Phone", type: "tel", placeholder: "+91 98765 43210" },
    { name: "office.email", label: "Email", type: "email" },
    { name: "office.hours", label: "Office hours", placeholder: "Mon–Sat, 10 am – 6 pm" },
    {
      name: "office.map_embed_url",
      label: "Google Maps embed URL",
      type: "url",
      wide: true,
      hint: "In Google Maps: Share → Embed a map, then copy only the address inside src=\"…\" (it starts with https://www.google.com/maps/embed).",
    },
    { name: "office.google_business_url", label: "Google Business profile URL", type: "url", wide: true },
  ],
};

const REGISTRATION: GroupConfig = {
  title: "Registration",
  description: "Your AMFI registration details, shown in the footer and on the Registration Details page.",
  keys: ["registration"],
  callout: <p>Copy these exactly from your AMFI ARN card. The Registration Details section stays hidden until the ARN is filled in.</p>,
  fields: [
    { name: "registration.arn", label: "ARN", placeholder: "ARN-123456" },
    { name: "registration.euin", label: "EUIN", placeholder: "E123456" },
    { name: "registration.arn_valid_from", label: "ARN valid from", type: "date" },
    { name: "registration.arn_valid_until", label: "ARN valid until", type: "date" },
    { name: "registration.euin_valid_until", label: "EUIN valid until", type: "date" },
    { name: "registration.cin", label: "CIN", hint: "Only if the business is a registered company.", placeholder: "U67190TN2020PTC123456" },
  ],
};

const GRIEVANCE: GroupConfig = {
  title: "Grievance officer",
  description: "Who investors can contact with a complaint. Shown on the Grievance Redressal page, the Investor Help Desk and in the footer once a name and an email or phone are filled in.",
  keys: ["grievance_officer"],
  fields: [
    { name: "grievance_officer.name", label: "Name" },
    { name: "grievance_officer.designation", label: "Designation" },
    { name: "grievance_officer.email", label: "Email", type: "email" },
    { name: "grievance_officer.phone", label: "Phone", type: "tel" },
    { name: "grievance_officer.address", label: "Address", multiline: true },
  ],
};

const LINKS: GroupConfig = {
  title: "Links",
  description: "Buttons that send visitors to other sites, and your social media pages.",
  keys: ["portal_url", "cta", "social_links"],
  fields: [
    {
      name: "portal_url",
      label: "Client portal URL",
      type: "url",
      wide: true,
      hint: "Where existing clients log in to see their investments (Wealth Elite). Adds the Client Login buttons; clear it to hide them.",
    },
    { name: "cta.start_sip_url", label: "“Start a SIP” link", type: "url", hint: "Adds a Start a SIP button to the home page hero." },
    { name: "cta.open_account_url", label: "“Open an account” link", type: "url" },
    { name: "social_links.facebook", label: "Facebook", type: "url" },
    { name: "social_links.instagram", label: "Instagram", type: "url" },
    { name: "social_links.linkedin", label: "LinkedIn", type: "url" },
    { name: "social_links.x", label: "X (Twitter)", type: "url" },
    { name: "social_links.youtube", label: "YouTube", type: "url" },
  ],
};

/** The logo's own colours, which the website uses while these fields are empty (globals.css). */
const DEFAULT_COLOURS = { primary_color: "#032b66", accent_color: "#f7a21b" } as const;
const COLOUR_NAMES = { primary_color: "navy", accent_color: "orange" } as const;
const BUNDLED_LOGO = "/brand/planit-logo.png";
// The cream page background: the darkest surface where the primary colour is used for text.
const PAGE_BACKGROUND = "#f5f1ed";
const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

function BrandingForm({ settings }: { settings: SiteSettings }) {
  const { form, save } = useSettingsForm(settings, ["branding"]);
  const { register, handleSubmit, watch, setValue, formState } = form;
  const logoUrl = watch("branding.logo_url") as string;
  const primary = ((watch("branding.primary_color") as string | undefined) ?? "").trim();
  const accent = ((watch("branding.accent_color") as string | undefined) ?? "").trim();
  const primaryContrast = isHex(primary) ? contrastRatio(primary, PAGE_BACKGROUND) : null;

  const resetToLogoColours = () => {
    setValue("branding.primary_color", "", { shouldDirty: true });
    setValue("branding.accent_color", "", { shouldDirty: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>
          The logo and the two brand colours: primary for buttons, links and the announcement bar; accent for the main
          home page button and highlights.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((values) => save.mutate(values))} noValidate className="space-y-5">
          <div className="grid gap-5 md:grid-cols-[1fr_12rem] md:items-start">
            <TextField
              label="Logo URL"
              optional
              hint="Leave empty to use the Planit logo built into the website."
              registration={register("branding.logo_url")}
              error={get(formState.errors, "branding.logo_url")?.message}
            />
            <div className="grid h-20 place-items-center rounded-lg border bg-white p-2">
              {/* A preview of whatever the admin typed (it may live on any host), or the built-in logo. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl || BUNDLED_LOGO} alt="Logo preview" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {(["primary_color", "accent_color"] as const).map((key) => {
              const name = `branding.${key}`;
              const value = (watch(name) as string) || DEFAULT_COLOURS[key];
              return (
                <div key={key} className="flex items-start gap-3">
                  <TextField
                    label={key === "primary_color" ? "Primary colour" : "Accent colour"}
                    optional
                    placeholder={DEFAULT_COLOURS[key]}
                    hint={`Hex, e.g. ${DEFAULT_COLOURS[key]}. Leave empty for the logo's ${COLOUR_NAMES[key]}.`}
                    registration={register(name)}
                    error={get(formState.errors, name)?.message}
                    className="flex-1"
                  />
                  <input
                    type="color"
                    aria-label={`Pick the ${key === "primary_color" ? "primary" : "accent"} colour`}
                    value={isHex(value) ? value : DEFAULT_COLOURS[key]}
                    onChange={(event) => setValue(name, event.target.value, { shouldDirty: true })}
                    className="mt-[1.375rem] h-8 w-10 cursor-pointer rounded-md border bg-transparent p-0.5"
                  />
                </div>
              );
            })}
          </div>
          {primaryContrast !== null && primaryContrast < 4.5 && (
            <Callout tone="warning">
              <p>
                This primary colour is too light to read on the website&apos;s light background (contrast{" "}
                {primaryContrast.toFixed(1)}:1; text needs at least 4.5:1). Links and outline buttons use it for their
                text, so choose a darker shade.
              </p>
            </Callout>
          )}
          {(primary || accent) && (
            <Button type="button" variant="outline" size="sm" onClick={resetToLogoColours}>
              <RotateCcwIcon data-icon="inline-start" /> Use the logo colours
            </Button>
          )}
          <SaveBar pending={save.isPending} dirty={formState.isDirty} />
        </form>
      </CardContent>
    </Card>
  );
}

const MAX_STATS = 6;

function StatsForm({ settings }: { settings: SiteSettings }) {
  const { form, save } = useSettingsForm(settings, ["stats"]);
  const { register, control, handleSubmit, formState } = form;
  const { fields, append, remove, move } = useFieldArray({ control, name: "stats" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stats</CardTitle>
        <CardDescription>Up to six figures for the home page. The band stays hidden while this list is empty.</CardDescription>
      </CardHeader>
      <CardContent>
        <Callout tone="warning">
          <p>
            Only show figures you can prove, such as years in practice or families served, and add an “as of” date in
            the note. Never show returns, rankings or anything that suggests a guaranteed result.
          </p>
        </Callout>
        <form onSubmit={handleSubmit((values) => save.mutate(values))} noValidate className="space-y-4">
          {fields.length === 0 && <p className="text-sm text-muted-foreground">No figures yet.</p>}
          <ol className="space-y-3">
            {fields.map((field, i) => (
              <li key={field.id} className="rounded-lg border p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Figure {i + 1}</span>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}>
                      <ArrowUpIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move down"
                      disabled={i === fields.length - 1}
                      onClick={() => move(i, i + 1)}
                    >
                      <ArrowDownIcon />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove figure ${i + 1}`} onClick={() => remove(i)}>
                      <Trash2Icon />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-[8rem_1fr_1fr]">
                  <TextField
                    label="Figure"
                    placeholder="12+"
                    maxLength={20}
                    registration={register(`stats.${i}.value`, { required: "Enter the figure." })}
                    error={get(formState.errors, `stats.${i}.value`)?.message}
                  />
                  <TextField
                    label="Label"
                    placeholder="Years in practice"
                    maxLength={60}
                    registration={register(`stats.${i}.label`, { required: "Enter a label." })}
                    error={get(formState.errors, `stats.${i}.label`)?.message}
                  />
                  <TextField
                    label="Note"
                    optional
                    placeholder="As of 30 Sep 2026"
                    maxLength={120}
                    registration={register(`stats.${i}.note`)}
                    error={get(formState.errors, `stats.${i}.note`)?.message}
                  />
                </div>
              </li>
            ))}
          </ol>
          <Button
            type="button"
            variant="outline"
            disabled={fields.length >= MAX_STATS}
            onClick={() => append({ value: "", label: "", note: "" })}
          >
            <PlusIcon data-icon="inline-start" /> Add figure
          </Button>
          <SaveBar pending={save.isPending} dirty={formState.isDirty} />
        </form>
      </CardContent>
    </Card>
  );
}

function SectionToggles({ settings }: { settings: SiteSettings }) {
  const toggle = useSave({
    mutationFn: ({ key, on }: { key: SectionKey; on: boolean }) => adminApi.updateSettings({ sections: { [key]: on } }),
    invalidate: [adminKeys.settings],
  });
  const keys = Object.keys(SECTION_INFO) as SectionKey[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sections</CardTitle>
        <CardDescription>
          Switch a section off to hide it. A switched-on section still stays hidden until it has the content it needs,
          so the website never shows placeholders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {keys.map((key) => {
            const info = SECTION_INFO[key];
            const on = settings.sections[key];
            const live = settings.visible_sections[key];
            return (
              <li key={key} className="flex items-start gap-3 py-3">
                <Switch
                  id={`section-${key}`}
                  checked={on}
                  disabled={toggle.isPending}
                  onCheckedChange={(checked) => toggle.mutate({ key, on: checked })}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1 text-sm">
                  <label htmlFor={`section-${key}`} className="font-medium">
                    {info.label}
                  </label>
                  <p className="text-muted-foreground">{info.where}</p>
                  {on && !live && info.needs && (
                    <p className="mt-1 text-amber-800">Hidden until you add {info.needs}.</p>
                  )}
                </div>
                <Badge variant={live ? "default" : "outline"} className="shrink-0">
                  {live ? "Showing" : on ? "Waiting for content" : "Off"}
                </Badge>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
