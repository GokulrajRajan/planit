import type { Faq } from "./services";

/** FAQs page (app/(site)/faqs). The home page shows the first few marked `home`. */
export const FAQ_GROUPS: { title: string; faqs: (Faq & { home?: boolean })[] }[] = [
  {
    title: "Getting started",
    faqs: [
      {
        q: "What is a mutual fund?",
        a: "A mutual fund pools money from many investors and invests it in shares, bonds or other assets according to a stated objective. A professional fund manager runs it, and SEBI regulates it.",
        home: true,
      },
      {
        q: "What do I need to start investing?",
        a: "A PAN, completed KYC, a bank account in your name and a mobile number and email address. We can help you complete your KYC if you haven't already.",
        home: true,
      },
      {
        q: "How much money do I need?",
        a: "Many schemes accept SIPs from a few hundred rupees a month. The minimum depends on the scheme.",
      },
      {
        q: "Can I invest online?",
        a: "Yes. Most investments can be made online once your KYC is complete. We can also help with paper forms if you prefer.",
      },
    ],
  },
  {
    title: "Risks and costs",
    faqs: [
      {
        q: "Are mutual fund returns guaranteed?",
        a: "No. Mutual fund investments are subject to market risks, and the value of your investment can go down as well as up. Past performance does not indicate future returns.",
        home: true,
      },
      {
        q: "What is a riskometer?",
        a: "Every scheme displays a riskometer showing its level of risk, from low to very high. It helps you compare schemes and choose ones that match how much risk you are comfortable with.",
      },
      {
        q: "What are expense ratios and exit loads?",
        a: "The expense ratio is the annual fee a fund charges to manage your money, taken from the fund's assets. An exit load is a charge some funds apply if you redeem within a set period. Both are listed in each scheme's documents.",
      },
    ],
  },
  {
    title: "About Planit",
    faqs: [
      {
        q: "Who is Planit?",
        a: "Planit is a mutual fund distributor. We help you understand and choose mutual fund schemes, handle the transactions and paperwork, and review your investments over time. Our registration details are on our Registration Disclosure page.",
        home: true,
      },
      {
        q: "Do you give investment advice?",
        a: "We are a mutual fund distributor, not a SEBI-registered investment adviser. We explain your options and help you choose from the schemes we distribute; for fee-based investment advice, you would need a registered investment adviser.",
      },
      {
        q: "How are you paid?",
        a: "Fund houses pay us a commission on the schemes you invest in through us. It is included in each scheme's expense ratio rather than charged to you separately, and our rates are listed in full on our Commission Disclosures page.",
        home: true,
      },
      {
        q: "Is the consultation really free?",
        a: "Yes. Your first consultation costs nothing and comes with no obligation to invest.",
      },
    ],
  },
  {
    title: "Your account",
    faqs: [
      {
        q: "How do I add or change a nominee?",
        a: "You can update nominees online through the fund house or its registrar, or we can help you do it. We recommend adding a nominee to every folio, or formally opting out.",
      },
      {
        q: "How do I raise a complaint?",
        a: "Contact us first, and we will try to resolve it quickly. If you are not satisfied, you can escalate it through SEBI's SCORES portal and the SMART ODR platform. Our Investor Help Desk explains each step.",
      },
    ],
  },
];

export const HOME_FAQS: Faq[] = FAQ_GROUPS.flatMap((group) => group.faqs.filter((faq) => faq.home));
