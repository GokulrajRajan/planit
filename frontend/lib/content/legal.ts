/**
 * The 12 legal pages (app/(site)/legal/[slug]). Their wording comes from the client: paste the approved
 * text into `sections`. Until then a page shows a short "being finalised" notice instead of draft legal text.
 *
 * `builtIn` pages also render content generated from site data (official links, registration details,
 * the grievance escalation path) above any client text.
 */

export type LegalSection = { heading?: string; paragraphs?: string[]; list?: string[] };

export type LegalPage = {
  slug: string;
  title: string;
  summary: string;
  sections: LegalSection[] | null;
  builtIn?: "important-links" | "registration" | "grievance";
};

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "risk-factors",
    title: "Risk Factors",
    summary: "The main risks of investing in mutual funds, and what they mean for you.",
    sections: null,
  },
  {
    slug: "terms-and-conditions",
    title: "Terms and Conditions",
    summary: "The terms that apply when you use this website and our services.",
    sections: null,
  },
  {
    slug: "disclaimer",
    title: "Disclaimer",
    summary: "Important information about the content on this website.",
    sections: null,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    summary: "How we collect, use and protect your personal information.",
    sections: null,
  },
  {
    slug: "grievance-redressal",
    title: "Grievance Redressal",
    summary: "How to raise a complaint with us, and how to escalate it if it isn't resolved.",
    sections: null,
    builtIn: "grievance",
  },
  {
    slug: "investor-charter",
    title: "Investor Charter",
    summary: "Our commitments to you, the services we offer and your rights as an investor.",
    sections: null,
  },
  {
    slug: "investor-rights-and-obligations",
    title: "Rights and Obligations of Investors",
    summary: "What you are entitled to as an investor, and what is expected of you.",
    sections: null,
  },
  {
    slug: "dos-and-donts",
    title: "Do's and Don'ts",
    summary: "Practical guidance to help you invest safely.",
    sections: null,
  },
  {
    slug: "commission-disclosures",
    title: "Commission Disclosures",
    summary: "The commission we receive from fund houses on the schemes we distribute.",
    sections: null,
  },
  {
    slug: "client-onboarding-and-kyc-policy",
    title: "Client Onboarding and KYC Policy",
    summary: "How we onboard clients and verify identity, as required by regulation.",
    sections: null,
  },
  {
    slug: "registration-disclosure",
    title: "Registration Disclosure",
    summary: "Our registration with the Association of Mutual Funds in India (AMFI).",
    sections: null,
    builtIn: "registration",
  },
  {
    slug: "important-links",
    title: "Important Links",
    summary: "Official websites of the regulator, industry body and depositories.",
    sections: null,
    builtIn: "important-links",
  },
];

export function getLegalPage(slug: string): LegalPage | undefined {
  return LEGAL_PAGES.find((page) => page.slug === slug);
}
