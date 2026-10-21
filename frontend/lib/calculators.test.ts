import { describe, expect, it } from "vitest";
import {
  compound,
  elssTaxSaving,
  formatINR,
  formatINRShort,
  goalPlan,
  growingAnnuityDue,
  lumpsumSchedule,
  niceTicks,
  retirementPlan,
  sipForTarget,
  sipFutureValue,
  sipSchedule,
  yearlySchedule,
} from "./calculators";

describe("SIP", () => {
  it("matches the standard start-of-month formula", () => {
    // ₹10,000 a month at 12% for 10 years: 10,000 × ((1.01^120 − 1) / 0.01) × 1.01
    expect(sipFutureValue(10_000, 12, 10)).toBeCloseTo(2_323_390.76, 0);
  });

  it("is just the sum of instalments at 0%", () => {
    expect(sipFutureValue(5_000, 0, 3)).toBe(180_000);
  });

  it("schedule ends at the closed-form value and tracks the amount invested", () => {
    const rows = sipSchedule({ monthly: 10_000, annualReturn: 12, years: 10 });
    expect(rows).toHaveLength(10);
    expect(rows[0]).toMatchObject({ year: 1, invested: 120_000 });
    expect(rows[9].invested).toBe(1_200_000);
    expect(rows[9].value).toBeCloseTo(sipFutureValue(10_000, 12, 10), 4);
  });

  it("step-up raises the instalment once a year", () => {
    const rows = sipSchedule({ monthly: 10_000, annualReturn: 12, years: 3, stepUp: 10 });
    // 12 × 10,000 + 12 × 11,000 + 12 × 12,100 = 1,20,000 + 1,32,000 + 1,45,200
    expect(rows[2].invested).toBeCloseTo(397_200, 6);
    expect(rows[2].value).toBeGreaterThan(sipFutureValue(10_000, 12, 3));
  });

  it("sipForTarget is the inverse of sipFutureValue", () => {
    const monthly = sipForTarget(5_000_000, 10, 15);
    expect(sipFutureValue(monthly, 10, 15)).toBeCloseTo(5_000_000, 4);
    expect(sipForTarget(0, 10, 15)).toBe(0);
    expect(sipForTarget(100_000, 10, 0)).toBe(0);
  });
});

describe("Lumpsum", () => {
  it("compounds yearly", () => {
    expect(compound(100_000, 12, 10)).toBeCloseTo(310_584.82, 1);
    const rows = lumpsumSchedule({ amount: 100_000, annualReturn: 12, years: 10 });
    expect(rows).toHaveLength(10);
    expect(rows.every((row) => row.invested === 100_000)).toBe(true);
    expect(rows[0].value).toBeCloseTo(112_000, 6);
    expect(rows[9].value).toBeCloseTo(310_584.82, 1);
  });
});

describe("Goal", () => {
  it("inflates the cost and finds the SIP that reaches it", () => {
    const plan = goalPlan({ costToday: 2_000_000, years: 10, inflation: 6, annualReturn: 12 });
    expect(plan.futureCost).toBeCloseTo(3_581_695.4, 0); // 20 lakh × 1.06^10
    expect(plan.monthlySip).toBeCloseTo(plan.futureCost / 232.3390776, 1);
    expect(plan.schedule.at(-1)!.value).toBeCloseTo(plan.futureCost, 2);
    expect(plan.lumpsumToday).toBeCloseTo(plan.futureCost / 1.12 ** 10, 4);
  });

  it("counts existing savings towards the goal", () => {
    const plan = goalPlan({ costToday: 1_000_000, years: 5, inflation: 6, annualReturn: 10, currentSavings: 200_000 });
    expect(plan.savingsAtGoal).toBeCloseTo(200_000 * 1.1 ** 5, 4);
    expect(plan.shortfall).toBeCloseTo(plan.futureCost - plan.savingsAtGoal, 4);
    expect(plan.schedule.at(-1)!.value).toBeCloseTo(plan.futureCost, 2);
    expect(plan.schedule[0].invested).toBeCloseTo(200_000 + plan.monthlySip * 12, 6);
  });

  it("needs no SIP when savings already cover it", () => {
    const plan = goalPlan({ costToday: 100_000, years: 5, inflation: 6, annualReturn: 10, currentSavings: 500_000 });
    expect(plan.shortfall).toBe(0);
    expect(plan.monthlySip).toBe(0);
    expect(plan.lumpsumToday).toBe(0);
  });
});

describe("Retirement", () => {
  it("growing annuity: equal rates give payment × years", () => {
    expect(growingAnnuityDue(100_000, 6, 6, 25)).toBeCloseTo(2_500_000, 6);
  });

  it("growing annuity: no growth is an ordinary annuity due", () => {
    // 1,00,000 a year for 3 years at 10%, paid at the start of each year: 1 + 1/1.1 + 1/1.21
    expect(growingAnnuityDue(100_000, 10, 0, 3)).toBeCloseTo(273_553.72, 1);
  });

  it("builds the corpus, then the SIP that reaches it", () => {
    const plan = retirementPlan({
      currentAge: 30,
      retirementAge: 60,
      lifeExpectancy: 85,
      monthlyExpenses: 50_000,
      inflation: 6,
      preReturn: 10,
      postReturn: 6,
      currentSavings: 0,
    });
    expect(plan.yearsToRetire).toBe(30);
    expect(plan.yearsInRetirement).toBe(25);
    expect(plan.monthlyExpensesAtRetirement).toBeCloseTo(50_000 * 1.06 ** 30, 4);
    // Post-retirement return equals inflation, so the corpus is 25 years of the first year's expenses.
    expect(plan.corpusNeeded).toBeCloseTo(25 * 12 * plan.monthlyExpensesAtRetirement, 2);
    expect(plan.schedule).toHaveLength(30);
    expect(plan.schedule.at(-1)!.value).toBeCloseTo(plan.corpusNeeded, 0);
  });

  it("existing savings reduce the SIP", () => {
    const base = { currentAge: 35, retirementAge: 60, lifeExpectancy: 85, monthlyExpenses: 40_000, inflation: 6, preReturn: 10, postReturn: 7 };
    const without = retirementPlan(base);
    const withSavings = retirementPlan({ ...base, currentSavings: 1_000_000 });
    expect(withSavings.monthlySip).toBeLessThan(without.monthlySip);
    expect(withSavings.shortfall).toBeCloseTo(without.corpusNeeded - 1_000_000 * 1.1 ** 25, 2);
  });
});

describe("ELSS tax saving", () => {
  it("applies the slab plus 4% cess, capped at the deduction limit", () => {
    expect(elssTaxSaving(150_000, 30).taxSaved).toBeCloseTo(46_800, 6);
    expect(elssTaxSaving(200_000, 30)).toEqual({ eligible: 150_000, taxSaved: expect.closeTo(46_800, 6) });
    expect(elssTaxSaving(100_000, 20).taxSaved).toBeCloseTo(20_800, 6);
    expect(elssTaxSaving(150_000, 5).taxSaved).toBeCloseTo(7_800, 6);
    expect(elssTaxSaving(-5, 30).taxSaved).toBe(0);
  });

  it("grows a yearly investment made at the start of each year", () => {
    const rows = yearlySchedule({ yearly: 100_000, annualReturn: 10, years: 2 });
    expect(rows[0]).toEqual({ year: 1, invested: 100_000, value: expect.closeTo(110_000, 6) });
    expect(rows[1]).toEqual({ year: 2, invested: 200_000, value: expect.closeTo(231_000, 6) });
  });
});

describe("Formatting", () => {
  it("formats rupees with Indian grouping", () => {
    expect(formatINR(2_323_390.76)).toBe("₹23,23,391");
    expect(formatINR(950)).toBe("₹950");
  });

  it("shortens to K, lakh and crore", () => {
    expect(formatINRShort(950)).toBe("₹950");
    expect(formatINRShort(12_500)).toBe("₹12.5K");
    expect(formatINRShort(2_323_391)).toBe("₹23.2 L");
    expect(formatINRShort(500_000)).toBe("₹5 L");
    expect(formatINRShort(12_500_000)).toBe("₹1.25 Cr");
  });

  it("picks round axis ticks that reach the maximum", () => {
    expect(niceTicks(2_323_391)).toEqual([0, 1_000_000, 2_000_000, 3_000_000]);
    expect(niceTicks(95)).toEqual([0, 25, 50, 75, 100]);
    expect(niceTicks(0)).toEqual([0]);
  });
});
