/** Investor category pages (app/(site)/investors). Same copy rules as lib/content/services.ts. */

export type InvestorContent = {
  slug: string;
  title: string;
  headline: string;
  intro: string[];
  points: string[];
  /** Slugs from lib/content/services.ts. */
  relatedServices: string[];
  note?: string;
};

export const INVESTOR_CONTENT: InvestorContent[] = [
  {
    slug: "students",
    title: "Students",
    headline: "Start small. Start early.",
    intro: [
      "Your biggest advantage as a student is time. A small monthly SIP started now gets years longer to grow than the same amount started after your first job.",
      "We help you learn the basics, start with an amount you are comfortable with and build the habit early.",
    ],
    points: [
      "SIPs that start from small monthly amounts",
      "The basics explained: risk, returns, costs and compounding",
      "KYC made simple (investors under 18 invest through a parent or guardian)",
      "Building a small emergency fund before investing for the long term",
    ],
    relatedServices: ["sip-planning", "mutual-funds", "goal-planning"],
  },
  {
    slug: "salaried",
    title: "Salaried Individuals",
    headline: "Make every payday count.",
    intro: [
      "A regular salary makes regular investing easy: set up SIPs that go out just after payday, and your goals get funded before the month's spending starts.",
      "We help you plan for your goals, keep tax-saving on track through the year and see how your employer benefits fit in.",
    ],
    points: [
      "SIPs timed to your salary date",
      "Tax-saving investments under the old regime, planned through the year",
      "Plans for a home, your children's education and retirement",
      "Making sense of EPF, NPS and other employer benefits alongside mutual funds",
    ],
    relatedServices: ["sip-planning", "tax-saving-investments", "retirement-planning"],
  },
  {
    slug: "professionals",
    title: "Professionals",
    headline: "Steady plans for uneven incomes.",
    intro: [
      "Doctors, lawyers, consultants and other self-employed professionals often earn well but unevenly, and have no employer pension to fall back on.",
      "We help you invest when income comes in, keep a reserve for quieter months and build long-term wealth for retirement.",
    ],
    points: [
      "A mix of SIPs and lump-sum investments to match irregular income",
      "An emergency reserve for lean months",
      "Retirement planning without an employer pension",
      "Keeping business surplus separate from personal goals",
    ],
    relatedServices: ["goal-planning", "retirement-planning", "mutual-funds"],
  },
  {
    slug: "corporates-and-smes",
    title: "Corporates and SMEs",
    headline: "Put idle business cash to work.",
    intro: [
      "Businesses often hold cash they will need in days, weeks or months. Overnight, liquid and other short-duration debt funds can be an alternative to leaving it idle in a current account, with the flexibility to redeem when needed.",
      "We help you understand these funds, match them to your cash-flow needs and handle the account opening for your entity.",
    ],
    points: [
      "Overnight, liquid and short-duration debt funds explained",
      "Investments matched to your cash-flow needs",
      "Account opening for companies, LLPs, partnerships and proprietorships, with the documents each needs",
      "Statements to support your accounts and audits",
    ],
    relatedServices: ["mutual-funds"],
    note: "Debt funds carry interest-rate and credit risk. Their returns are not guaranteed, and they are not bank deposits.",
  },
  {
    slug: "nri",
    title: "NRIs",
    headline: "Invest in India from anywhere.",
    intro: [
      "Non-resident Indians can invest in Indian mutual funds through NRE or NRO bank accounts, subject to FEMA rules and each fund house's own policies.",
      "We help you complete KYC with your NRI status, choose funds for your goals in India and keep track of the paperwork from abroad.",
    ],
    points: [
      "KYC with your overseas address and NRI status",
      "Investing through NRE (repatriable) or NRO accounts",
      "Understanding tax deducted on redemptions, and your country of residence's own rules",
      "Fund houses that accept investors from your country (some limit investments from the US and Canada)",
    ],
    relatedServices: ["mutual-funds", "sip-planning", "goal-planning"],
    note: "Rules for NRI investments depend on your country of residence and can change. Please check your own tax position with a qualified professional.",
  },
];

export function getInvestorCategory(slug: string): InvestorContent | undefined {
  return INVESTOR_CONTENT.find((category) => category.slug === slug);
}
