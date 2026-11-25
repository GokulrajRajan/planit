import type { SiteSettings } from "./site-data";

/**
 * The client's own details, as supplied in November 2026. They fill whatever is still empty in the admin panel
 * (Site settings → Office and Registration), so the site shows them even without the backend. Anything saved in
 * the admin panel wins.
 */
const ADDRESS = {
  address_line1: "No. 90, P S Sivaswamy Salai",
  address_line2: "Mylapore",
  city: "Chennai",
  state: null,
  pincode: "600004",
};
const PHONE = "+91 98406 61811 / +91 98407 61811";
export const CLIENT_ARN = "ARN-293209";

/** Details with no field in the admin panel: change them here. */
export const REGISTRATIONS = {
  /** The ARN is held in this person's name, not the firm's. */
  arnHolder: "Prakash Ramarao",
  nse: "AP029759067",
  bse: "AP01044601167266",
  gstin: "33AAZFP8936F1ZK",
};

const ADDRESS_FIELDS = Object.keys(ADDRESS) as (keyof typeof ADDRESS)[];

/** `settings` with the client's details in place of anything the admin panel hasn't been given yet. */
export function withClientInfo(settings: SiteSettings): SiteSettings {
  const { office, registration } = settings;
  // The address is all or nothing, so lines typed in the admin panel never mix with these.
  const hasAddress = ADDRESS_FIELDS.some((field) => office[field]);
  const arn = registration.arn || CLIENT_ARN;
  return {
    ...settings,
    office: { ...office, ...(hasAddress ? null : ADDRESS), phone: office.phone || PHONE },
    registration: { ...registration, arn },
    visible_sections: {
      ...settings.visible_sections,
      // The backend hides this section while its own ARN is empty; the admin's on/off switch still applies.
      registration_details: settings.sections.registration_details,
    },
  };
}

/** Splits a phone field such as "98406 61811 / 98407 61811" into one link per number. */
export function phoneLinks(phone: string): { label: string; href: string }[] {
  return phone
    .split(/[/,;]/)
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => {
      const digits = label.replace(/[^\d+]/g, "");
      // Ten digits starting with 6–9 is an Indian mobile number without its country code.
      return { label, href: `tel:${/^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : digits}` };
    });
}
