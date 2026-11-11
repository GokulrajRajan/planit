/**
 * Products and services, grouped the way the Services menu shows them. Each category has a landing page
 * at /<category> and each product a page at /<category>/<slug> (app/(site)/[category]).
 *
 * Copy rules: Planit distributes products; it does not advise. Never promise or imply returns, attribute
 * research and broking to the partner that provides it, and keep each product's disclaimer.
 */

export type Faq = { q: string; a: string };

/** The body shared by category and product pages. */
type PageContent = {
  title: string;
  /** Shorter label for the menu, when the page title is long. */
  menuLabel?: string;
  /** Matches ENQUIRY_SERVICES in backend/app/models/enquiry.py, to pre-select the enquiry form. */
  enquiryValue?: string;
  /** Hero intro and card text. */
  summary: string;
  /** Strapline above the opening paragraphs. */
  heading?: string;
  intro: string[];
  /** Checklist beside the opening paragraphs. */
  list?: { title: string; items: string[] };
  sections?: { title: string; subtitle?: string; body?: string[]; items?: string[] }[];
  goodFor?: string[];
  faqs?: Faq[];
  calculator?: { label: string; href: string };
  /** Closing line, e.g. "PLANIT — Put Your Investments to Work for You." */
  signoff?: string;
  note?: string;
  disclaimer?: string;
  /** Mutual fund pages show the four-step "How it works" band. */
  howItWorks?: boolean;
};

export type ProductPage = PageContent & { slug: string };
export type ProductCategory = PageContent & {
  slug: string;
  pages: ProductPage[];
  /** Has its own top-level menu tab (lib/site.ts) instead of sitting under Services. */
  ownTab?: boolean;
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

const SECURITIES_DISCLAIMER =
  "Investments in securities market are subject to market risks, read all the related documents carefully before investing.";

const PMS_AIF_DISCLAIMER =
  "PMS and AIF investments involve market and other risks, including the potential loss of capital. Minimum investment requirements, eligibility, liquidity, fees, and taxation vary by product. Returns are not guaranteed. Investments are subject to applicable SEBI regulations and the relevant offering documents.";

const INSURANCE_DISCLAIMER =
  "Insurance is the subject matter of solicitation. Policies are issued by the insurer; please read the policy wording, benefits, exclusions and terms carefully before buying.";

const PMS_AIF_DISTRIBUTION =
  "Through our distribution network, we help investors understand available strategies, investment objectives, eligibility criteria, minimum investment requirements, and associated risks, enabling them to make informed investment decisions aligned with their financial goals.";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
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
    list: {
      title: "How we help",
      items: [
        "Understanding the main fund categories: equity, debt, hybrid, index funds and more",
        "Shortlisting schemes that suit your goal, time horizon and risk profile",
        "Completing KYC and investing online or on paper",
        "Bringing scattered folios together and keeping nominations up to date",
        "Regular portfolio reviews as your goals change",
      ],
    },
    sections: [
      {
        title: "Partnered with India’s Leading Fund Houses",
        body: [
          "We are empanelled with India’s top fund houses, including Nippon India Mutual Fund, Franklin Templeton, ICICI Prudential Mutual Fund, HDFC Mutual Fund, SBI Mutual Fund, Sundaram Mutual Fund and many more, bringing you a wide choice of schemes managed by experienced fund managers.",
        ],
      },
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
    howItWorks: true,
    pages: [
      {
        slug: "sip-planning",
        title: "SIP Planning",
        enquiryValue: "sip_planning",
        summary: "Invest a fixed amount regularly and build an investing habit that fits your monthly budget.",
        intro: [
          "A Systematic Investment Plan (SIP) invests a fixed amount in a mutual fund at regular intervals, usually every month. Because you invest the same amount whether markets are up or down, you buy more units when prices are low and fewer when they are high. This rupee cost averaging does not guarantee a profit or protect against losses, but it takes away the pressure of timing the market.",
          "We help you decide how much to invest, in which funds and for how long, so your SIPs line up with the goals they are meant to fund.",
        ],
        list: {
          title: "How we help",
          items: [
            "Working out a monthly amount that fits your budget",
            "Choosing funds suited to each goal and time horizon",
            "Setting up auto-debit mandates with your bank",
            "Step-up SIPs that rise with your income",
            "Reviewing, pausing or switching SIPs when your plans change",
          ],
        },
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
        howItWorks: true,
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
        list: {
          title: "How we help",
          items: [
            "Listing and prioritising your goals",
            "Estimating future costs with inflation in mind",
            "Matching each goal with suitable funds and SIPs",
            "Tracking progress and rebalancing along the way",
            "Moving money to lower-risk options as a goal date gets close",
          ],
        },
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
        howItWorks: true,
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
        list: {
          title: "How we help",
          items: [
            "Estimating your retirement expenses and the corpus to aim for",
            "Building a long-term mix of equity and debt funds",
            "Seeing how EPF, PPF and NPS fit alongside your mutual funds",
            "Gradually reducing risk as retirement approaches",
            "Planning withdrawals, including systematic withdrawal plans (SWPs)",
          ],
        },
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
        howItWorks: true,
      },
      {
        slug: "tax-planning",
        title: "Tax Saving Investments",
        enquiryValue: "tax_saving",
        summary: "Understand how ELSS funds can reduce your tax under the old tax regime, and what their lock-in means.",
        intro: [
          "Equity Linked Savings Schemes (ELSS) are equity mutual funds that qualify for a tax deduction under the old income-tax regime, within the overall limit for eligible investments. Each investment is locked in for three years from the date it is made, the shortest lock-in among the common tax-saving options.",
          "We help you decide whether ELSS suits you, compare it with other tax-saving choices, and spread your investments through the year instead of rushing in March.",
        ],
        list: {
          title: "How we help",
          items: [
            "Checking whether a tax-saving investment helps under the tax regime you've chosen",
            "Comparing ELSS with options such as PPF, tax-saving fixed deposits and insurance premiums",
            "Spreading tax-saving investments across the year with SIPs",
            "Tracking the lock-in date of every instalment",
            "Fitting tax-saving investments into your long-term goals",
          ],
        },
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
        note: "Tax benefits depend on your circumstances and on tax law, which can change. Please confirm the current rules with a qualified tax professional before investing.",
        howItWorks: true,
      },
    ],
  },
  {
    slug: "trading",
    title: "Trading Services",
    summary:
      "Stock trading and Demat accounts, IPO applications and loans against your investments, through our broking and lending partners.",
    heading: "Your Gateway to the Stock Market",
    intro: [
      "We are the proud franchise partners of Motilal Oswal Financial Services group, offering access to equity investments, mutual funds, IPOs, and other financial products. Through our association, we help clients explore investment opportunities and participate in the financial markets.",
    ],
    disclaimer: SECURITIES_DISCLAIMER,
    pages: [
      {
        slug: "broking-demat",
        title: "Broking & Demat Services",
        menuLabel: "Broking & Demat",
        enquiryValue: "broking_demat",
        summary: "Stock trading and Demat account facilities through our broking partner, Motilal Oswal.",
        heading: "Your Gateway to the Stock Market",
        intro: [
          "We are the proud franchise partners of Motilal Oswal Financial Services group, offering access to equity investments, mutual funds, IPOs, and other financial products. Through our association, we help clients explore investment opportunities and participate in the financial markets.",
          "Explore opportunities in the Indian equity markets with stock trading and Demat account facilities through our broking partner. Whether you are a beginner or an experienced investor, we help you get started with access to market participation and investment opportunities.",
        ],
        sections: [
          {
            title: "Why Choose Us",
            subtitle: "Physical & Digital: experience the advantage of both worlds.",
            body: [
              "When it comes to creating wealth, you need a service provider to partner with you for all your financial needs. At PLANIT, we are associated with Motilal Oswal Financial Services Limited, ranked as the ‘Best Performing National Financial Advisor-Equity Broker’ at the CNBC TV18 Financial Advisor Awards for six years. Through this association, our clients get Motilal Oswal’s technology for trade execution and its award-winning research and analysis, across all platforms, i.e. desktop, tablet, and mobile.",
            ],
            items: [
              "Leverage products",
              "Personalised equity trading advice",
              "Research-backed equity investment plans",
              "Profile and risk-based trading platform",
              "Secured trading across all devices",
              "Simplified trading reports",
            ],
          },
        ],
        disclaimer: SECURITIES_DISCLAIMER,
      },
      {
        slug: "ipo",
        title: "IPO Services",
        menuLabel: "IPO",
        enquiryValue: "ipo",
        summary: "Discover opportunities in new public issues, with clear information on offer details, price bands and how to apply.",
        heading: "Discover Opportunities in New Public Issues",
        intro: [
          "At PLANIT, we help investors explore Initial Public Offerings (IPOs) by providing information on upcoming public issues, offer details, price bands, subscription periods, and application procedures. Our aim is to make the IPO application process simpler and help investors make informed decisions.",
          "Whether you are exploring your first IPO or regularly participating in public issues, PLANIT helps you stay informed and access IPO opportunities through the appropriate investment platforms.",
        ],
        signoff: "Explore IPO Opportunities with PLANIT — Stay Informed. Invest Wisely.",
        disclaimer:
          "IPO investments are subject to market risks. Listing gains and returns are not guaranteed. Investors should read the offer documents carefully before investing.",
      },
      {
        slug: "loan-against-securities",
        title: "Loan Against Securities",
        enquiryValue: "loan_against_securities",
        summary: "Unlock liquidity without selling your investments, by pledging eligible securities with our lending partners.",
        heading: "Unlock Liquidity Without Selling Your Investments.",
        intro: [
          "A Loan Against Securities allows you to access funds by pledging eligible investments such as shares, mutual funds, bonds, and other approved securities as collateral. It can help meet planned or unexpected financial needs while allowing you to retain ownership of your pledged investments, subject to the lender's terms.",
          "At PLANIT, we help customers explore Loan Against Securities facilities through lending partners, understand eligibility requirements, applicable interest rates, loan limits, and repayment terms, and identify options suited to their financial needs.",
        ],
        signoff: "PLANIT — Put Your Investments to Work for You.",
        calculator: { label: "EMI calculator", href: "/calculators/emi" },
        disclaimer:
          "Loans are provided by our lending partners and are subject to their eligibility checks, interest rates and terms. If the value of pledged securities falls, the lender may ask for additional margin or sell the pledged securities.",
      },
    ],
  },
  {
    slug: "invest",
    title: "Invest",
    ownTab: true,
    summary: "Bonds and unlisted shares, for investors who want to look beyond mutual funds and listed stocks.",
    intro: [
      "Alongside mutual funds and listed shares, some investors look at fixed-income instruments for regular income, or at companies that are not yet listed on a stock exchange. We help you understand how these investments work, what they cost and the risks they carry, so you can decide whether they suit your goals.",
    ],
    pages: [
      {
        slug: "bonds",
        title: "Bonds & Fixed-Income Investments",
        menuLabel: "Bonds",
        enquiryValue: "bonds",
        summary: "Earn income and diversify your portfolio with bonds issued by governments and companies.",
        heading: "Earn Income. Diversify Your Portfolio.",
        intro: [
          "Bonds offer investors an opportunity to lend money to governments or companies in return for interest payments, subject to the terms of the investment. They can help diversify a portfolio and may provide a source of regular income, depending on the bond's features.",
          "At PLANIT, we help investors explore bond investment opportunities based on their financial goals, investment horizon, and risk appetite.",
        ],
        disclaimer:
          "Bond investments are subject to credit, interest rate, liquidity, and market risks. Returns are not guaranteed unless explicitly provided under the instrument's terms. Please review the relevant offer documents before investing.",
      },
      {
        slug: "unlisted-shares",
        title: "Unlisted Shares & Private Placements",
        menuLabel: "Unlisted Shares (Private Placements)",
        enquiryValue: "unlisted_shares",
        summary: "Access opportunities beyond listed markets, in unlisted companies and eligible private placements.",
        heading: "Access Opportunities Beyond Listed Markets.",
        intro: [
          "Explore investment opportunities in unlisted companies and eligible private placements through PLANIT. Unlisted shares provide exposure to companies that are not listed on recognised stock exchanges, while private placements involve securities offered privately to a select group of eligible investors in accordance with applicable regulations.",
          "At PLANIT, we help investors understand available opportunities, indicative valuations, transaction procedures, and associated risks, enabling them to make informed decisions based on their investment objectives and risk appetite.",
        ],
        signoff: "PLANIT — Discover Opportunities. Invest with Awareness.",
        disclaimer:
          "Investments in unlisted securities and private placements carry risks, including limited liquidity, valuation uncertainty, limited disclosures, and potential loss of capital. Eligibility, minimum investment amounts, and transfer restrictions may apply. A future stock exchange listing is not guaranteed. Investments are subject to applicable regulations and the relevant offer documents.",
      },
    ],
  },
  {
    slug: "wealth",
    title: "Wealth",
    summary: "Portfolio Management Services and Alternative Investment Funds for eligible investors.",
    heading: "Explore Advanced Investment Opportunities. Diversify Your Wealth.",
    intro: [
      "At PLANIT, we help eligible investors explore specialised investment solutions through Portfolio Management Services (PMS) and Alternative Investment Funds (AIFs). These offerings provide access to professionally managed portfolios and alternative investment strategies that may complement traditional investments such as mutual funds and stocks.",
      PMS_AIF_DISTRIBUTION,
    ],
    signoff: "PLANIT — Expanding Opportunities for Informed Investors.",
    disclaimer: PMS_AIF_DISCLAIMER,
    pages: [
      {
        slug: "pms",
        title: "PMS Distribution",
        enquiryValue: "pms",
        summary: "Professionally managed portfolios of stocks and other securities, held in your own name, for eligible investors.",
        heading: "Explore Advanced Investment Opportunities.",
        intro: [
          "Portfolio Management Services (PMS) give you a professionally managed portfolio of stocks and other securities, held in your own name and managed by a SEBI-registered portfolio manager according to a stated strategy.",
          PMS_AIF_DISTRIBUTION,
        ],
        list: {
          title: "What to look at",
          items: [
            "The portfolio manager's strategy and investment approach",
            "The minimum investment (₹50 lakh under current SEBI rules)",
            "Fees, including any performance-linked fee",
            "Liquidity, exit terms and taxation",
            "The disclosure document and client agreement",
          ],
        },
        signoff: "PLANIT — Expanding Opportunities for Informed Investors.",
        disclaimer: PMS_AIF_DISCLAIMER,
      },
      {
        slug: "aif",
        title: "AIF Distribution",
        enquiryValue: "aif",
        summary: "Privately pooled, SEBI-registered funds that follow alternative investment strategies, for eligible investors.",
        heading: "Diversify Your Wealth.",
        intro: [
          "Alternative Investment Funds (AIFs) are privately pooled investment funds registered with SEBI. Depending on their category, they may invest in areas such as unlisted companies, private credit, real estate or long-short equity strategies.",
          PMS_AIF_DISTRIBUTION,
        ],
        list: {
          title: "What to look at",
          items: [
            "The fund's category (I, II or III) and strategy",
            "The minimum investment (generally ₹1 crore under current SEBI rules)",
            "Lock-in, fund tenure and liquidity",
            "Fees, expenses and taxation",
            "The private placement memorandum",
          ],
        },
        signoff: "PLANIT — Expanding Opportunities for Informed Investors.",
        disclaimer: PMS_AIF_DISCLAIMER,
      },
    ],
  },
  {
    slug: "protect",
    title: "Protect",
    summary: "Protect what matters and secure your future, with health, term life and motor insurance through our insurance partners.",
    heading: "Protect What Matters. Secure Your Future.",
    intro: [
      "At PLANIT, we believe that financial well-being is not just about creating wealth, but also about protecting what you value most. Our insurance solutions help individuals and families explore suitable protection options to safeguard their health, life, and financial future.",
      "Through our insurance partners, HDFC ERGO General Insurance and Axis Max Life Insurance, we help customers explore a range of insurance products designed to address different protection needs and life goals.",
    ],
    disclaimer: INSURANCE_DISCLAIMER,
    pages: [
      {
        slug: "life-term-insurance",
        title: "Term Life Insurance",
        enquiryValue: "term_insurance",
        summary: "Protect your family and secure their future with life cover for a specified period.",
        heading: "Protect Your Family. Secure Their Future.",
        intro: [
          "Term insurance is a life insurance solution designed to provide financial protection to your loved ones in the event of uncertainty during the policy term. It offers a life cover for a specified period, helping your family manage financial responsibilities such as household expenses, outstanding loans, children's education, and future goals.",
          "At PLANIT, we help you explore term insurance options that align with your family's needs, financial commitments, and budget, so you can take a step towards securing their financial future.",
        ],
        signoff: "PLANIT — Your Family's Future Deserves Protection.",
        disclaimer: INSURANCE_DISCLAIMER,
      },
      {
        slug: "health-insurance",
        title: "Health Insurance",
        enquiryValue: "health_insurance",
        summary: "Explore coverage options to help manage the financial burden of medical expenses and hospitalisation.",
        intro: [
          "Explore coverage options to help manage the financial burden of medical expenses and hospitalisation.",
          "Through our partner HDFC ERGO General Insurance, we help you compare health insurance plans for yourself and your family, and understand what each one covers before you buy.",
        ],
        list: {
          title: "What to look at",
          items: [
            "The sum insured, and whether it covers your whole family",
            "Network hospitals near you for cashless treatment",
            "Waiting periods for pre-existing conditions",
            "Room-rent limits, co-payments and exclusions",
            "How claims are made and settled",
          ],
        },
        disclaimer: INSURANCE_DISCLAIMER,
      },
      {
        slug: "motor-insurance",
        title: "Motor Insurance",
        enquiryValue: "motor_insurance",
        summary: "Protect your vehicle against covered risks and meet applicable insurance requirements.",
        intro: [
          "Protect your vehicle against covered risks and meet applicable insurance requirements.",
          "Third-party motor insurance is mandatory for every vehicle used on public roads in India, and a comprehensive policy adds cover for damage to your own vehicle. Through our partner HDFC ERGO General Insurance, we help you compare options and renew on time.",
        ],
        list: {
          title: "What to look at",
          items: [
            "Third-party or comprehensive cover",
            "The Insured Declared Value (IDV) of your vehicle",
            "Add-ons such as zero depreciation and roadside assistance",
            "Your no-claim bonus on renewal",
            "The claim process and network garages",
          ],
        },
        disclaimer: INSURANCE_DISCLAIMER,
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
        list: {
          title: "How we help",
          items: [
            "Listing the life and health policies you already have",
            "Checking cover against your income, dependants and loans",
            "Explaining the difference between pure protection and investment-linked policies",
            "Noting gaps to discuss with your insurer",
            "Keeping nominee details consistent across policies and investments",
          ],
        },
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
        disclaimer: INSURANCE_DISCLAIMER,
      },
    ],
  },
];

export const categoryHref = (category: ProductCategory) => `/${category.slug}`;
export const productHref = (category: ProductCategory, page: ProductPage) => `/${category.slug}/${page.slug}`;

export const getCategory = (slug: string) => PRODUCT_CATEGORIES.find((category) => category.slug === slug);

export function getProduct(categorySlug: string, slug: string) {
  const category = getCategory(categorySlug);
  const page = category?.pages.find((p) => p.slug === slug);
  return category && page ? { category, page } : undefined;
}

/** Every category and product page, flattened, with its URL. Slugs are unique across the whole tree. */
export const ALL_PRODUCTS = PRODUCT_CATEGORIES.flatMap((category) => [
  { ...category, href: categoryHref(category) },
  ...category.pages.map((page) => ({ ...page, href: productHref(category, page) })),
]);

export const findProduct = (slug: string) => ALL_PRODUCTS.find((product) => product.slug === slug);
