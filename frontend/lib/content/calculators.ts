/** The calculator pages, in menu order (app/(site)/calculators). */
export const CALCULATORS = [
  {
    slug: "sip",
    title: "SIP Calculator",
    summary: "See how a monthly SIP could grow over time, with an optional yearly step-up.",
    service: { label: "SIP Planning", href: "/mutual-funds/sip-planning" },
  },
  {
    slug: "lumpsum",
    title: "Lumpsum Calculator",
    summary: "Estimate what a one-time investment could be worth after a number of years.",
    service: { label: "Mutual Funds", href: "/mutual-funds" },
  },
  {
    slug: "retirement",
    title: "Retirement Calculator",
    summary: "Estimate the corpus you may need to retire, and the monthly SIP to build it.",
    service: { label: "Retirement Planning", href: "/mutual-funds/retirement-planning" },
  },
  {
    slug: "goal",
    title: "Goal Calculator",
    summary: "Put a future price on a goal and see the monthly SIP that could get you there.",
    service: { label: "Goal Planning", href: "/mutual-funds/goal-planning" },
  },
  {
    slug: "emi",
    title: "EMI Calculator",
    summary: "Work out the monthly EMI on a loan, the total interest and how the balance comes down each year.",
    service: { label: "Loan Against Securities", href: "/trading/loan-against-securities" },
  },
] as const;

export type CalculatorSlug = (typeof CALCULATORS)[number]["slug"];

export const getCalculator = (slug: CalculatorSlug) => CALCULATORS.find((c) => c.slug === slug)!;
