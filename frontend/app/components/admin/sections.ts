import type { SectionKey } from "@/lib/site-data";

// Plain module (not "use client") so server pages can read these values too.

export const SETTINGS_TABS = [
  { value: "branding", label: "Branding" },
  { value: "office", label: "Office" },
  { value: "registration", label: "Registration" },
  { value: "grievance", label: "Grievance officer" },
  { value: "links", label: "Links" },
  { value: "stats", label: "Stats" },
  { value: "sections", label: "Sections" },
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number]["value"];

/** What each section toggle controls, and what it needs before it can show (settings_service.visible_sections). */
export const SECTION_INFO: Record<SectionKey, { label: string; where: string; needs: string | null; fixHref: string }> = {
  announcement_bar: {
    label: "Announcement bar",
    where: "Thin strip above the header on every page.",
    needs: "an active announcement with the “Announcement bar” placement",
    fixHref: "/admin/announcements",
  },
  stats: {
    label: "Stats",
    where: "Figures band on the home page.",
    needs: "at least one figure under Stats",
    fixHref: "/admin/settings?tab=stats",
  },
  testimonials: {
    label: "Testimonials",
    where: "Home page.",
    needs: "a visible testimonial",
    fixHref: "/admin/testimonials",
  },
  team: {
    label: "Team",
    where: "About → Our Team page.",
    needs: "a visible team member",
    fixHref: "/admin/team",
  },
  newsletter: { label: "Newsletter sign-up", where: "Sign-up box on the home page.", needs: null, fixHref: "/admin/settings?tab=sections" },
  faq: { label: "Home page FAQs", where: "FAQ section on the home page (the FAQs page always shows).", needs: null, fixHref: "/admin/settings?tab=sections" },
  market_update: {
    label: "Market Update",
    where: "Market Update page and its menu link.",
    needs: "a published Market Update post",
    fixHref: "/admin/market-update",
  },
  registration_details: {
    label: "Registration details",
    where: "Footer and the Registration Details page.",
    needs: "the ARN under Registration",
    fixHref: "/admin/settings?tab=registration",
  },
  grievance_officer: {
    label: "Grievance officer",
    where: "Footer, Grievance Redressal page and the Investor Help Desk.",
    needs: "the officer’s name and an email or phone",
    fixHref: "/admin/settings?tab=grievance",
  },
  office_map: {
    label: "Office map",
    where: "Contact page.",
    needs: "a Google Maps embed URL under Office",
    fixHref: "/admin/settings?tab=office",
  },
  social_links: {
    label: "Social links",
    where: "Footer and the Contact page.",
    needs: "at least one social link",
    fixHref: "/admin/settings?tab=links",
  },
  client_login: {
    label: "Client login",
    where: "Header and footer buttons, and the Client Login page.",
    needs: "the client portal URL under Links",
    fixHref: "/admin/settings?tab=links",
  },
};
