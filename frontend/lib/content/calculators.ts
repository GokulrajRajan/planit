/** The calculator pages, in menu order (app/(site)/calculators). */
export const CALCULATORS = [
  {
    slug: "sip",
    title: "SIP Calculator",
    summary: "See how a monthly SIP could grow over time, with an optional yearly step-up.",
    service: { label: "SIP Planning", href: "/services/sip-planning" },
  },
  {
    slug: "lumpsum",
    title: "Lumpsum Calculator",
    summary: "Estimate what a one-time investment could be worth after a number of years.",
    service: { label: "Mutual Funds", href: "/services/mutual-funds" },
  },
  {
    slug: "retirement",
    title: "Retirement Calculator",
    summary: "Estimate the corpus you may need to retire, and the monthly SIP to build it.",
    service: { label: "Retirement Planning", href: "/services/retirement-planning" },
  },
  {
    slug: "goal",
    title: "Goal Calculator",
    summary: "Put a future price on a goal and see the monthly SIP that could get you there.",
    service: { label: "Goal Planning", href: "/services/goal-planning" },
  },
  {
    slug: "tax-saving",
    title: "Tax Saving Calculator",
    summary: "See how much tax ELSS investments could save under the old regime.",
    service: { label: "Tax Saving Investments", href: "/services/tax-saving-investments" },
  },
] as const;

export type CalculatorSlug = (typeof CALCULATORS)[number]["slug"];

export const getCalculator = (slug: CalculatorSlug) => CALCULATORS.find((c) => c.slug === slug)!;
