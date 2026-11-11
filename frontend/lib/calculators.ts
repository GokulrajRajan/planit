/**
 * Maths for the calculators (app/(site)/calculators). Pure functions, unit-tested in calculators.test.ts.
 *
 * Rates are annual percentages (12 means 12% a year). Every result assumes a constant rate of return,
 * which real investments never deliver, so the pages present them as illustrations, not projections.
 */

/** One point per completed year: total put in so far, and its estimated value at that rate. */
export type YearRow = { year: number; invested: number; value: number };

const monthlyRate = (annualPercent: number) => annualPercent / 12 / 100;
const yearlyRate = (annualPercent: number) => annualPercent / 100;

/** `amount` grown (or inflated) at `ratePercent` a year, compounded yearly. */
export function compound(amount: number, ratePercent: number, years: number): number {
  return amount * (1 + yearlyRate(ratePercent)) ** years;
}

/**
 * Value of 1 rupee invested at the start of every month for `months` months: the SIP growth factor
 * ((1 + i)^n − 1) / i × (1 + i), with instalments at the start of each month.
 */
function sipFactor(annualReturn: number, months: number): number {
  const i = monthlyRate(annualReturn);
  if (months <= 0) return 0;
  if (i === 0) return months;
  return (((1 + i) ** months - 1) / i) * (1 + i);
}

export function sipFutureValue(monthly: number, annualReturn: number, years: number): number {
  return monthly * sipFactor(annualReturn, years * 12);
}

/** Monthly SIP that reaches `target` in `years` (0 when there is nothing left to save). */
export function sipForTarget(target: number, annualReturn: number, years: number): number {
  if (target <= 0 || years <= 0) return 0;
  return target / sipFactor(annualReturn, years * 12);
}

/**
 * Year-by-year SIP growth. With `stepUp`, the monthly instalment rises by that percentage at the
 * start of each new year. With no step-up the final value equals sipFutureValue.
 */
export function sipSchedule({
  monthly,
  annualReturn,
  years,
  stepUp = 0,
}: {
  monthly: number;
  annualReturn: number;
  years: number;
  stepUp?: number;
}): YearRow[] {
  const i = monthlyRate(annualReturn);
  const rows: YearRow[] = [];
  let value = 0;
  let invested = 0;
  let instalment = monthly;
  for (let month = 1; month <= years * 12; month++) {
    value = (value + instalment) * (1 + i);
    invested += instalment;
    if (month % 12 === 0) {
      rows.push({ year: month / 12, invested, value });
      instalment *= 1 + stepUp / 100;
    }
  }
  return rows;
}

export function lumpsumSchedule({ amount, annualReturn, years }: { amount: number; annualReturn: number; years: number }): YearRow[] {
  return Array.from({ length: years }, (_, k) => ({
    year: k + 1,
    invested: amount,
    value: compound(amount, annualReturn, k + 1),
  }));
}

/** A SIP schedule plus existing savings that keep growing at the same rate alongside it. */
function withSavings(rows: YearRow[], savings: number, annualReturn: number): YearRow[] {
  return rows.map((row) => ({
    year: row.year,
    invested: row.invested + savings,
    value: row.value + compound(savings, annualReturn, row.year),
  }));
}

export type GoalPlan = {
  futureCost: number;
  savingsAtGoal: number;
  shortfall: number;
  monthlySip: number;
  lumpsumToday: number;
  schedule: YearRow[];
};

export function goalPlan({
  costToday,
  years,
  inflation,
  annualReturn,
  currentSavings = 0,
}: {
  costToday: number;
  years: number;
  inflation: number;
  annualReturn: number;
  currentSavings?: number;
}): GoalPlan {
  const futureCost = compound(costToday, inflation, years);
  const savingsAtGoal = compound(currentSavings, annualReturn, years);
  const shortfall = Math.max(0, futureCost - savingsAtGoal);
  const monthlySip = sipForTarget(shortfall, annualReturn, years);
  return {
    futureCost,
    savingsAtGoal,
    shortfall,
    monthlySip,
    lumpsumToday: shortfall / (1 + yearlyRate(annualReturn)) ** years,
    schedule: withSavings(sipSchedule({ monthly: monthlySip, annualReturn, years }), currentSavings, annualReturn),
  };
}

/**
 * Present value, at the start of the first year, of `periods` yearly payments that start at
 * `firstPayment` and grow by `growthPercent` a year, while the balance earns `ratePercent`
 * (a growing annuity paid at the start of each year).
 */
export function growingAnnuityDue(firstPayment: number, ratePercent: number, growthPercent: number, periods: number): number {
  if (periods <= 0) return 0;
  const r = yearlyRate(ratePercent);
  const g = yearlyRate(growthPercent);
  if (Math.abs(r - g) < 1e-12) return firstPayment * periods;
  return ((firstPayment * (1 - ((1 + g) / (1 + r)) ** periods)) / (r - g)) * (1 + r);
}

export type RetirementPlan = {
  yearsToRetire: number;
  yearsInRetirement: number;
  monthlyExpensesAtRetirement: number;
  corpusNeeded: number;
  savingsAtRetirement: number;
  shortfall: number;
  monthlySip: number;
  schedule: YearRow[];
};

/**
 * The corpus covers expenses that keep rising with inflation through retirement, drawn at the start
 * of each year from a balance still earning `postReturn`.
 */
export function retirementPlan({
  currentAge,
  retirementAge,
  lifeExpectancy,
  monthlyExpenses,
  inflation,
  preReturn,
  postReturn,
  currentSavings = 0,
}: {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  monthlyExpenses: number;
  inflation: number;
  preReturn: number;
  postReturn: number;
  currentSavings?: number;
}): RetirementPlan {
  const yearsToRetire = Math.max(0, retirementAge - currentAge);
  const yearsInRetirement = Math.max(0, lifeExpectancy - retirementAge);
  const monthlyExpensesAtRetirement = compound(monthlyExpenses, inflation, yearsToRetire);
  const corpusNeeded = growingAnnuityDue(12 * monthlyExpensesAtRetirement, postReturn, inflation, yearsInRetirement);
  const savingsAtRetirement = compound(currentSavings, preReturn, yearsToRetire);
  const shortfall = Math.max(0, corpusNeeded - savingsAtRetirement);
  const monthlySip = sipForTarget(shortfall, preReturn, yearsToRetire);
  return {
    yearsToRetire,
    yearsInRetirement,
    monthlyExpensesAtRetirement,
    corpusNeeded,
    savingsAtRetirement,
    shortfall,
    monthlySip,
    schedule: withSavings(sipSchedule({ monthly: monthlySip, annualReturn: preReturn, years: yearsToRetire }), currentSavings, preReturn),
  };
}

/* ───────────── Loans ───────────── */

/** Monthly instalment on a reducing-balance loan: P × i × (1 + i)^n / ((1 + i)^n − 1). */
export function emi(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const i = monthlyRate(annualRate);
  if (i === 0) return principal / months;
  const growth = (1 + i) ** months;
  return (principal * i * growth) / (growth - 1);
}

/** One row per year of the loan: principal and interest repaid that year, and the balance left at its end. */
export type LoanYearRow = { year: number; principal: number; interest: number; balance: number };

export type LoanPlan = { emi: number; totalInterest: number; totalPayment: number; schedule: LoanYearRow[] };

/** EMI, totals and a yearly repayment schedule, with interest charged monthly on the reducing balance. */
export function loanPlan({ principal, annualRate, years }: { principal: number; annualRate: number; years: number }): LoanPlan {
  const months = Math.max(0, Math.round(years * 12));
  const instalment = emi(principal, annualRate, months);
  const i = monthlyRate(annualRate);
  const schedule: LoanYearRow[] = [];
  let balance = principal;
  let yearPrincipal = 0;
  let yearInterest = 0;
  for (let month = 1; month <= months; month++) {
    const interest = balance * i;
    balance -= instalment - interest;
    yearPrincipal += instalment - interest;
    yearInterest += interest;
    if (month % 12 === 0 || month === months) {
      schedule.push({ year: Math.ceil(month / 12), principal: yearPrincipal, interest: yearInterest, balance: Math.max(0, balance) });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }
  const totalPayment = instalment * months;
  return { emi: instalment, totalInterest: Math.max(0, totalPayment - principal), totalPayment, schedule };
}

/* ───────────── Formatting ───────────── */

/** ₹12,34,567 (Indian digit grouping, whole rupees). */
export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** ₹950, ₹12.5K, ₹4.2 L, ₹1.25 Cr: compact Indian units for axes and labels. */
export function formatINRShort(amount: number): string {
  const abs = Math.abs(amount);
  const trim = (n: number, digits: number) => String(Number(n.toFixed(digits)));
  if (abs >= 1e7) return `₹${trim(amount / 1e7, 2)} Cr`;
  if (abs >= 1e5) return `₹${trim(amount / 1e5, 1)} L`;
  if (abs >= 1e3) return `₹${trim(amount / 1e3, 1)}K`;
  return `₹${Math.round(amount)}`;
}

/** Round axis ticks from 0 up to at least `max`: steps of 1, 2, 2.5 or 5 × 10ⁿ, about `count` of them. */
export function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0];
  const rough = max / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= rough) ?? 10 * power;
  const ticks: number[] = [];
  for (let t = 0; t < max + step * 0.999; t += step) ticks.push(Number(t.toFixed(6)));
  return ticks;
}
