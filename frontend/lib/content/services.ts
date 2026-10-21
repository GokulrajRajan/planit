/**
 * Service pages (app/(site)/services). Copy rules: Planit is a mutual fund distributor, not an adviser;
 * never promise or imply returns; describe commissions as fully disclosed.
 */

export type Faq = { q: string; a: string };

export type ServiceContent = {
  slug: string;
  title: string;
  /** Matches ENQUIRY_SERVICES in backend/app/models/enquiry.py, to pre-select the enquiry form. */
  enquiryValue: string;
  summary: string;
  intro: string[];
  helpWith: string[];
  goodFor: string[];
  faqs: Faq[];
  calculator?: { label: string; href: string };
  note?: string;
};

export const HOW_IT_WORKS = [
  {
    title: "Talk to us",
    body: "Book a free consultation. Tell us about your goals, income, existing investments and how you feel about risk.",
  },
  {
    title: "Get a plan",
    body: "We suggest funds and SIP amounts for each goal, explain the risks and costs, and answer every question.",
  },
  {
    title: "Invest",
    body: "Complete your KYC and invest online or on paper. We handle the paperwork with you.",
  },
  {
    title: "Review",
    body: "We review your portfolio regularly, and whenever your life or your goals change.",
  },
];

export const SERVICE_CONTENT: ServiceContent[] = [
  {
    slug: "mutual-funds",
    title: "Mutual Funds",
    enquiryValue: "mutual_funds",
    summary:
      "Understand your options across equity, debt and hybrid funds, and choose schemes that suit your goals and comfort with risk.",
    intro: [
      "A mutual fund pools money from many investors and invests it in shares, bonds or other assets, managed by a professional fund manager. There are thousands of schemes, and the right ones for you depend on what you are investing for, how long you can stay invested and how much ups and downs you can live with.",
      "As a mutual fund distributor, we help you make sense of those choices, complete the paperwork and keep your investments organised in one place.",
    ],
    helpWith: [
      "Understanding the main fund categories: equity, debt, hybrid, index funds and more",
      "Shortlisting schemes that suit your goal, time horizon and risk profile",
      "Completing KYC and investing online or on paper",
      "Bringing scattered folios together and keeping nominations up to date",
      "Regular portfolio reviews as your goals change",
    ],
    goodFor: [
      "First-time investors who want a clear starting point",
      "Investors with scattered folios who want one organised view",
      "Anyone who wants to understand what they own, and why",
    ],
    faqs: [
      {
        q: "Are mutual funds safe?",
        a: "Mutual funds are regulated by SEBI, but they are market-linked: the value of your investment can go up or down, and returns are not guaranteed. Each scheme shows its level of risk on a riskometer, from low to very high.",
      },
      {
        q: "How much do I need to start?",
        a: "Many schemes accept SIPs from a few hundred rupees a month and lump sums from a few thousand. The minimum amount depends on the scheme.",
      },
      {
        q: "How are you paid?",
        a: "Fund houses pay us a commission on the schemes you invest in through us; it is included in the scheme's expense ratio, not charged to you separately. Our commission rates are listed in full on our Commission Disclosures page.",
      },
    ],
    calculator: { label: "Lumpsum calculator", href: "/calculators/lumpsum" },
  },
  {
    slug: "sip-planning",
    title: "SIP Planning",
    enquiryValue: "sip_planning",
    summary: "Invest a fixed amount regularly and build an investing habit that fits your monthly budget.",
    intro: [
      "A Systematic Investment Plan (SIP) invests a fixed amount in a mutual fund at regular intervals, usually every month. Because you invest the same amount whether markets are up or down, you buy more units when prices are low and fewer when they are high. This rupee cost averaging does not guarantee a profit or protect against losses, but it takes away the pressure of timing the market.",
      "We help you decide how much to invest, in which funds and for how long, so your SIPs line up with the goals they are meant to fund.",
    ],
    helpWith: [
      "Working out a monthly amount that fits your budget",
      "Choosing funds suited to each goal and time horizon",
      "Setting up auto-debit mandates with your bank",
      "Step-up SIPs that rise with your income",
      "Reviewing, pausing or switching SIPs when your plans change",
    ],
    goodFor: [
      "Salaried investors with a regular monthly income",
      "Young investors starting with small amounts",
      "Anyone saving towards a goal several years away",
    ],
    faqs: [
      {
        q: "Can I pause or stop a SIP?",
        a: "Yes. SIPs can usually be paused or stopped at any time without a penalty, though exit loads or lock-ins (for example on ELSS funds) may apply to units you redeem.",
      },
      {
        q: "What is a step-up SIP?",
        a: "A step-up (or top-up) SIP raises your instalment by a fixed amount or percentage at set intervals, usually once a year, so your investing keeps pace with your income.",
      },
      {
        q: "Does a SIP guarantee returns?",
        a: "No. A SIP is a way of investing, not a product. Returns depend on how the fund you invest in performs, and the value of your investment can fall as well as rise.",
      },
    ],
    calculator: { label: "SIP calculator", href: "/calculators/sip" },
  },
  {
    slug: "goal-planning",
    title: "Goal Planning",
    enquiryValue: "goal_planning",
    summary: "Turn goals like a home, your children's education or a family holiday into a clear investment plan.",
    intro: [
      "Saving 'for the future' is hard to stick with. Saving for a specific goal, with a target amount and a date, is much easier. Goal planning starts with what you want to achieve and works backwards to how much you need to invest, and where.",
      "We help you put a realistic estimate on each goal, allowing for inflation, and match it with investments suited to how far away it is.",
    ],
    helpWith: [
      "Listing and prioritising your goals",
      "Estimating future costs with inflation in mind",
      "Matching each goal with suitable funds and SIPs",
      "Tracking progress and rebalancing along the way",
      "Moving money to lower-risk options as a goal date gets close",
    ],
    goodFor: [
      "Families planning for education, a home or a wedding",
      "Professionals with several goals competing for the same income",
      "Anyone who wants every rupee they invest to have a purpose",
    ],
    faqs: [
      {
        q: "How many goals should I plan for?",
        a: "As many as matter to you, but it helps to prioritise. We usually start with an emergency fund, then long-term goals such as retirement and education, then shorter-term plans.",
      },
      {
        q: "What if I fall behind on a goal?",
        a: "Plans are reviewed regularly. If a goal is off track we look at the options together: investing more, extending the timeline or adjusting the target.",
      },
    ],
    calculator: { label: "Goal calculator", href: "/calculators/goal" },
  },
  {
    slug: "retirement-planning",
    title: "Retirement Planning",
    enquiryValue: "retirement_planning",
    summary: "Estimate what you'll need, start investing early, and plan how your savings will support you later.",
    intro: [
      "Retirement may be your largest financial goal, and the one where starting early makes the biggest difference: the longer your money stays invested, the more time it has to grow and to recover from market falls.",
      "We help you estimate the amount you may need, build it with a suitable mix of mutual funds, and plan how to draw an income from it once you stop working.",
    ],
    helpWith: [
      "Estimating your retirement expenses and the corpus to aim for",
      "Building a long-term mix of equity and debt funds",
      "Seeing how EPF, PPF and NPS fit alongside your mutual funds",
      "Gradually reducing risk as retirement approaches",
      "Planning withdrawals, including systematic withdrawal plans (SWPs)",
    ],
    goodFor: [
      "Young professionals who want to start early",
      "Mid-career investors checking whether they are on track",
      "People nearing retirement who need to plan an income",
    ],
    faqs: [
      {
        q: "When should I start planning for retirement?",
        a: "As early as you can. Small amounts invested in your twenties or thirties have far longer to grow than larger amounts invested later.",
      },
      {
        q: "What is an SWP?",
        a: "A systematic withdrawal plan takes a fixed amount out of a mutual fund at regular intervals, which can provide a steady income in retirement. Withdrawals may be taxable, and the money that stays invested is still exposed to market movements.",
      },
    ],
    calculator: { label: "Retirement calculator", href: "/calculators/retirement" },
  },
  {
    slug: "tax-saving-investments",
    title: "Tax Saving Investments",
    enquiryValue: "tax_saving",
    summary: "Understand how ELSS funds can reduce your tax under the old tax regime, and what their lock-in means.",
    intro: [
      "Equity Linked Savings Schemes (ELSS) are equity mutual funds that qualify for a tax deduction under the old income-tax regime, within the overall limit for eligible investments. Each investment is locked in for three years from the date it is made, the shortest lock-in among the common tax-saving options.",
      "We help you decide whether ELSS suits you, compare it with other tax-saving choices, and spread your investments through the year instead of rushing in March.",
    ],
    helpWith: [
      "Checking whether a tax-saving investment helps under the tax regime you've chosen",
      "Comparing ELSS with options such as PPF, tax-saving fixed deposits and insurance premiums",
      "Spreading tax-saving investments across the year with SIPs",
      "Tracking the lock-in date of every instalment",
      "Fitting tax-saving investments into your long-term goals",
    ],
    goodFor: [
      "Taxpayers who use the old tax regime",
      "Salaried employees who submit investment proofs to their employer",
      "Long-term investors who are comfortable with equity risk",
    ],
    faqs: [
      {
        q: "Do ELSS funds save tax under the new tax regime?",
        a: "No. The deduction for ELSS investments is available only under the old tax regime.",
      },
      {
        q: "How does the lock-in work with a SIP?",
        a: "Each SIP instalment is locked in for three years from its own date, so your units become available for redemption in stages.",
      },
    ],
    calculator: { label: "Tax saving calculator", href: "/calculators/tax-saving" },
    note: "Tax benefits depend on your circumstances and on tax law, which can change. Please confirm the current rules with a qualified tax professional before investing.",
  },
  {
    slug: "insurance-review",
    title: "Insurance Review",
    enquiryValue: "insurance_review",
    summary: "Check that your life and health cover still fits your family's needs before you invest more.",
    intro: [
      "Insurance protects your family and your investments. Without enough cover, an illness or emergency can force you to break investments meant for long-term goals.",
      "We look at the policies you already hold with you, help you understand what they cover and where the gaps may be, and explain how protection and investing fit together in your plan.",
    ],
    helpWith: [
      "Listing the life and health policies you already have",
      "Checking cover against your income, dependants and loans",
      "Explaining the difference between pure protection and investment-linked policies",
      "Noting gaps to discuss with your insurer",
      "Keeping nominee details consistent across policies and investments",
    ],
    goodFor: [
      "Families with dependants or a home loan",
      "Anyone who bought policies years ago and hasn't looked at them since",
      "Investors who want protection sorted before investing more",
    ],
    faqs: [
      {
        q: "How much life cover do I need?",
        a: "A common starting point is enough to repay your loans and replace your income for your dependants for a number of years. The right amount depends on your situation, which is what a review helps you work out.",
      },
    ],
    note: "An insurance review is for information. Insurance policies are issued by insurers; read the policy documents carefully before you buy.",
  },
];

export function getService(slug: string): ServiceContent | undefined {
  return SERVICE_CONTENT.find((service) => service.slug === slug);
}
