"use client";

import { useState } from "react";
import { formatINR, retirementPlan } from "@/lib/calculators";
import { GrowthChart } from "./GrowthChart";
import { RangeField } from "./RangeField";
import { IllustrativeNote, ResultCard } from "./Result";

const MAX_RETIREMENT_AGE = 75;
const MAX_LIFE_EXPECTANCY = 100;

export function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAgeInput, setRetirementAge] = useState(60);
  const [lifeExpectancyInput, setLifeExpectancy] = useState(85);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50_000);
  const [inflation, setInflation] = useState(6);
  const [preReturn, setPreReturn] = useState(10);
  const [postReturn, setPostReturn] = useState(7);
  const [currentSavings, setCurrentSavings] = useState(500_000);

  // Keep the ages in order without extra state: retirement after today, life expectancy after retirement.
  const retirementAge = Math.min(MAX_RETIREMENT_AGE, Math.max(retirementAgeInput, currentAge + 1));
  const lifeExpectancy = Math.min(MAX_LIFE_EXPECTANCY, Math.max(lifeExpectancyInput, retirementAge + 1));

  const plan = retirementPlan({
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenses,
    inflation,
    preReturn,
    postReturn,
    currentSavings,
  });
  const covered = plan.shortfall === 0;

  return (
    <div className="calc">
      <div className="calc__inputs">
        <RangeField label="Your age" unit="years" suffix="years" value={currentAge} onChange={setCurrentAge} min={18} max={MAX_RETIREMENT_AGE - 1} step={1} />
        <RangeField label="Retirement age" unit="years" suffix="years" value={retirementAge} onChange={setRetirementAge} min={currentAge + 1} max={MAX_RETIREMENT_AGE} step={1} />
        <RangeField label="Plan until age" unit="years" suffix="years" value={lifeExpectancy} onChange={setLifeExpectancy} min={retirementAge + 1} max={MAX_LIFE_EXPECTANCY} step={1} />
        <RangeField label="Monthly expenses today" unit="rupees" prefix="₹" value={monthlyExpenses} onChange={setMonthlyExpenses} min={5_000} max={1_000_000} step={1_000} />
        <RangeField label="Expected inflation" unit="percent a year" suffix="% p.a." value={inflation} onChange={setInflation} min={0} max={15} step={0.5} />
        <RangeField label="Return before retirement" unit="percent a year" suffix="% p.a." value={preReturn} onChange={setPreReturn} min={0} max={30} step={0.5} />
        <RangeField label="Return after retirement" unit="percent a year" suffix="% p.a." value={postReturn} onChange={setPostReturn} min={0} max={20} step={0.5} />
        <RangeField label="Retirement savings so far" unit="rupees" prefix="₹" value={currentSavings} onChange={setCurrentSavings} min={0} max={100_000_000} step={10_000} />
      </div>

      <div className="calc__results">
        <ResultCard
          label="Monthly SIP needed until retirement"
          value={formatINR(plan.monthlySip)}
          rows={[
            { label: `Corpus needed at ${retirementAge}`, value: formatINR(plan.corpusNeeded) },
            { label: `Monthly expenses at ${retirementAge}`, value: formatINR(plan.monthlyExpensesAtRetirement) },
            ...(currentSavings > 0 ? [{ label: `Savings so far, by ${retirementAge}`, value: formatINR(plan.savingsAtRetirement) }] : []),
          ]}
        >
          {covered && <p className="result-card__hint">At these assumptions, your existing savings could cover the corpus.</p>}
        </ResultCard>
        {!covered && (
          <GrowthChart
            rows={plan.schedule}
            target={{ value: plan.corpusNeeded, label: "Corpus needed" }}
            xLabel={(year) => `Age ${currentAge + year}`}
            caption={`Estimated growth of a ${formatINR(plan.monthlySip)} monthly SIP${currentSavings > 0 ? " plus your existing savings" : ""} from age ${currentAge} to ${retirementAge}, towards a corpus of ${formatINR(plan.corpusNeeded)}.`}
          />
        )}
        <IllustrativeNote>
          The corpus is sized to cover your expenses, rising with inflation, from {retirementAge} until {lifeExpectancy},
          while the remaining balance earns the after-retirement return. Taxes are not included.
        </IllustrativeNote>
      </div>
    </div>
  );
}
