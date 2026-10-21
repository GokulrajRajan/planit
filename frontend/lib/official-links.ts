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
  smartOdr: {
    name: "SMART ODR",
    label: "Online Dispute Resolution portal for the securities market",
    href: "https://smartodr.in",
  },
  amfi: {
    name: "AMFI",
    label: "Association of Mutual Funds in India",
    href: "https://www.amfiindia.com",
  },
  cdsl: {
    name: "CDSL",
    label: "Central Depository Services (India) Limited",
    href: "https://www.cdslindia.com",
  },
  nsdl: {
    name: "NSDL",
    label: "National Securities Depository Limited",
    href: "https://nsdl.co.in",
  },
  mfCentral: {
    name: "MF Central",
    label: "Investor service platform run by the mutual fund registrars (KYC status, folios, service requests)",
    href: "https://www.mfcentral.com",
  },
} as const;

export type OfficialLinkKey = keyof typeof OFFICIAL_LINKS;
