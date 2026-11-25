/**
 * Official regulator and market-infrastructure links, kept in one place so they can be checked before
 * launch (and whenever a regulator moves a page). Use these instead of typing the URLs elsewhere.
 *
 * Last checked: not yet. Open each link, confirm it is the official site, then record the date here.
 */
export const OFFICIAL_LINKS = {
  sebi: {
    name: "SEBI",
    label: "Securities and Exchange Board of India",
    href: "https://www.sebi.gov.in",
  },
  scores: {
    name: "SCORES",
    label: "SEBI Complaints Redress System",
    href: "https://scores.sebi.gov.in",
  },
  amfi: {
    name: "AMFI",
    label: "Association of Mutual Funds in India",
    href: "https://www.amfiindia.com",
  },
  camsEdge360: {
    name: "CAMS edge360",
    label: "CAMS platform for mutual fund distributors and advisors",
    href: "https://edge360.camsonline.com",
  },
  mfCentral: {
    name: "MF Central",
    label: "Investor service platform run by the mutual fund registrars (KYC status, folios, service requests)",
    href: "https://www.mfcentral.com",
  },
  kfintech: {
    name: "KFintech",
    label: "KFin Technologies, registrar and transfer agent for many mutual funds (folio services and requests)",
    href: "https://www.kfintech.com",
  },
} as const;

export type OfficialLinkKey = keyof typeof OFFICIAL_LINKS;
