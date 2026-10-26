/**
 * Site structure shared by the header, footer and pages: every internal URL lives here, so a page
 * added in a later phase only needs to exist at the path listed below.
 */

export type NavLink = { label: string; href: string };
export type NavGroup = { label: string; links: NavLink[] };

/** Services, in menu order. `enquiryValue` matches ENQUIRY_SERVICES in backend/app/models/enquiry.py. */
export const SERVICES = [
  { label: "Mutual Funds", href: "/services/mutual-funds", enquiryValue: "mutual_funds" },
  { label: "SIP Planning", href: "/services/sip-planning", enquiryValue: "sip_planning" },
  { label: "Goal Planning", href: "/services/goal-planning", enquiryValue: "goal_planning" },
  { label: "Retirement Planning", href: "/services/retirement-planning", enquiryValue: "retirement_planning" },
  { label: "Tax Saving Investments", href: "/services/tax-saving-investments", enquiryValue: "tax_saving" },
  { label: "Insurance Review", href: "/services/insurance-review", enquiryValue: "insurance_review" },
] as const;

export const ENQUIRY_SERVICE_OPTIONS = [
  ...SERVICES.map(({ label, enquiryValue }) => ({ label, value: enquiryValue })),
  { label: "Something else", value: "other" },
];

export const ROUTES = {
  home: "/",
  contact: "/contact",
  clientLogin: "/client-login",
  helpDesk: "/investor-help-desk",
  calculators: "/calculators",
  blog: "/blog",
  marketUpdate: "/market-update",
  faqs: "/faqs",
  usefulLinks: "/useful-links",
  privacyPolicy: "/legal/privacy-policy",
  commissionDisclosures: "/legal/commission-disclosures",
} as const;

/** Header dropdowns, in menu order. "Investor Category", "About Us" and "Knowledge Center" are headings, not pages. */
export const HEADER_NAV: NavGroup[] = [
  {
    label: "Services",
    links: [{ label: "Overview", href: "/services" }, ...SERVICES.map(({ label, href }) => ({ label, href }))],
  },
  {
    label: "Investor Category",
    links: [
      { label: "Students", href: "/investors/students" },
      { label: "Salaried Individuals", href: "/investors/salaried" },
      { label: "Professionals", href: "/investors/professionals" },
      { label: "Corporates and SMEs", href: "/investors/corporates-and-smes" },
      { label: "NRIs", href: "/investors/nri" },
    ],
  },
  {
    label: "About Us",
    links: [
      { label: "About Planit", href: "/about" },
      { label: "Mission and Values", href: "/about/mission-and-values" },
      { label: "Our Team", href: "/about/team" },
    ],
  },
  {
    label: "Knowledge Center",
    links: [
      { label: "Blog", href: ROUTES.blog },
      { label: "Market Update", href: ROUTES.marketUpdate },
      { label: "FAQs", href: ROUTES.faqs },
      { label: "Useful Links", href: ROUTES.usefulLinks },
    ],
  },
  {
    label: "Calculators",
    links: [
      { label: "All calculators", href: ROUTES.calculators },
      { label: "SIP Calculator", href: "/calculators/sip" },
      { label: "Lumpsum Calculator", href: "/calculators/lumpsum" },
      { label: "Retirement Calculator", href: "/calculators/retirement" },
      { label: "Goal Calculator", href: "/calculators/goal" },
      { label: "Tax Saving Calculator", href: "/calculators/tax-saving" },
    ],
  },
];

/** The header menu, minus links to sections that are hidden (switched off or still without content). */
export function headerNav({ marketUpdate }: { marketUpdate: boolean }): NavGroup[] {
  return HEADER_NAV.map((group) => ({
    ...group,
    links: group.links.filter((link) => marketUpdate || link.href !== ROUTES.marketUpdate),
  }));
}

export const FOOTER_QUICK_LINKS: NavLink[] = [
  { label: "About Planit", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Calculators", href: ROUTES.calculators },
  { label: "Investor Help Desk", href: ROUTES.helpDesk },
  { label: "Blog", href: ROUTES.blog },
  { label: "FAQs", href: ROUTES.faqs },
  { label: "Contact Us", href: ROUTES.contact },
];

/** The 12 legal pages, split into two footer columns. */
export const LEGAL_NAV: NavGroup[] = [
  {
    label: "Investor information",
    links: [
      { label: "Investor Charter", href: "/legal/investor-charter" },
      { label: "Rights and Obligations of Investors", href: "/legal/investor-rights-and-obligations" },
      { label: "Do's and Don'ts", href: "/legal/dos-and-donts" },
      { label: "Grievance Redressal", href: "/legal/grievance-redressal" },
      { label: "Client Onboarding and KYC Policy", href: "/legal/client-onboarding-and-kyc-policy" },
      { label: "Important Links", href: "/legal/important-links" },
    ],
  },
  {
    label: "Legal and disclosures",
    links: [
      { label: "Risk Factors", href: "/legal/risk-factors" },
      { label: "Terms and Conditions", href: "/legal/terms-and-conditions" },
      { label: "Disclaimer", href: "/legal/disclaimer" },
      { label: "Privacy Policy", href: ROUTES.privacyPolicy },
      { label: "Commission Disclosures", href: ROUTES.commissionDisclosures },
      { label: "Registration Disclosure", href: "/legal/registration-disclosure" },
    ],
  },
];

/** AMFI's mandatory warning for mutual fund communications: keep the wording exactly as is. */
export const MF_RISK_WARNING = "Mutual Fund investments are subject to market risks, read all scheme related documents carefully.";
