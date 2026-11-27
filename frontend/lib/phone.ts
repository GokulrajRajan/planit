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
