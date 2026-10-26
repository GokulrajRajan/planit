import type { Metadata } from "next";
import { SettingsAdmin } from "../../components/admin/SettingsAdmin";
import { SETTINGS_TABS } from "../../components/admin/sections";

export const metadata: Metadata = { title: "Site settings" };

type Props = { searchParams: Promise<{ tab?: string }> };

/** ?tab=… opens a specific tab (the dashboard's setup checklist links straight to the right one). */
export default async function Page({ searchParams }: Props) {
  const { tab } = await searchParams;
  const initialTab = SETTINGS_TABS.find((t) => t.value === tab)?.value ?? "branding";
  return <SettingsAdmin key={initialTab} initialTab={initialTab} />;
}
