/**
 * Site structure shared by the header, footer and pages: every internal URL lives here, so a page
 * added in a later phase only needs to exist at the path listed below.
 */

import { CALCULATORS } from "./content/calculators";
import { INVESTOR_CONTENT } from "./content/investors";
import { ALL_PRODUCTS, categoryHref, PRODUCT_CATEGORIES, productHref, type ProductCategory } from "./content/services";

/**
 * `links` makes a fly-out sub-menu (Services → Mutual Funds → SIP Planning, …). An empty `href` means the
 * item is only a heading for its fly-out, not a page.
 */
export type NavLink = { label: string; href: string; links?: NavLink[] };
export type NavGroup = { label: string; links: NavLink[] };

/** Every product with an enquiry value, in menu order. Values match ENQUIRY_SERVICES in backend/app/models/enquiry.py. */
export const ENQUIRY_SERVICE_OPTIONS = [
  ...ALL_PRODUCTS.flatMap(({ title, enquiryValue }) => (enquiryValue ? [{ label: title, value: enquiryValue }] : [])),
  { label: "Something else", value: "other" },
];

const productLinks = (category: ProductCategory): NavLink[] =>
  category.pages.map((page) => ({ label: page.menuLabel ?? page.title, href: productHref(category, page) }));

/** Services menu: each product category opens a sub-menu of its pages. */
const SERVICES_MENU: NavLink[] = PRODUCT_CATEGORIES.filter((category) => !category.ownTab).map((category) => ({
  label: category.menuLabel ?? category.title,
  href: categoryHref(category),
  links: productLinks(category),
}));

/** Invest tab: Bonds and Unlisted Shares, plus the investor groups in a fly-out. */
const INVEST = PRODUCT_CATEGORIES.find((category) => category.ownTab)!;
const INVEST_MENU: NavLink[] = [
  ...productLinks(INVEST),
  {
    label: "Investor Category",
    href: "",
    links: INVESTOR_CONTENT.map(({ slug, title }) => ({ label: title, href: `/investors/${slug}` })),
  },
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

/** Header dropdowns, in menu order. The tab labels are headings, not pages. */
export const HEADER_NAV: NavGroup[] = [
  {
    label: "Services",
    links: [{ label: "Overview", href: "/services" }, ...SERVICES_MENU],
  },
  {
    label: INVEST.title,
    links: INVEST_MENU,
  },
  {
    label: "About Us",
    links: [
      { label: "About Planit", href: "/about" },
      { label: "Mission and Values", href: "/about/mission-and-values" },
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
    links: CALCULATORS.map(({ slug, title }) => ({ label: title, href: `${ROUTES.calculators}/${slug}` })),
  },
];

/** True when `pathname` is one of the links, or one of their sub-menu links. */
export const navContains = (links: NavLink[], pathname: string): boolean =>
  links.some((link) => link.href === pathname || navContains(link.links ?? [], pathname));

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
