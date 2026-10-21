"use client";

import { useState } from "react";
import { formatINR, goalPlan } from "@/lib/calculators";
import { GrowthChart } from "./GrowthChart";
import { RangeField } from "./RangeField";
import { IllustrativeNote, ResultCard } from "./Result";

export function GoalCalculator() {
  const [costToday, setCostToday] = useState(2_000_000);
  const [years, setYears] = useState(10);
  const [inflation, setInflation] = useState(6);
  const [annualReturn, setAnnualReturn] = useState(10);
  const [currentSavings, setCurrentSavings] = useState(0);

  const plan = goalPlan({ costToday, years, inflation, annualReturn, currentSavings });
  const covered = plan.shortfall === 0;

  return (
    <div className="calc">
      <div className="calc__inputs">
        <RangeField label="Cost of the goal today" unit="rupees" prefix="₹" value={costToday} onChange={setCostToday} min={10_000} max={100_000_000} step={10_000} />
        <RangeField label="Years until the goal" unit="years" suffix="years" value={years} onChange={setYears} min={1} max={40} step={1} />
        <RangeField label="Expected inflation" unit="percent a year" suffix="% p.a." value={inflation} onChange={setInflation} min={0} max={15} step={0.5} />
        <RangeField label="Expected return" unit="percent a year" suffix="% p.a." value={annualReturn} onChange={setAnnualReturn} min={0} max={30} step={0.5} />
        <RangeField label="Savings already set aside" unit="rupees" prefix="₹" value={currentSavings} onChange={setCurrentSavings} min={0} max={100_000_000} step={10_000} />
      </div>

      <div className="calc__results">
        <ResultCard
          label={covered ? "Monthly SIP needed" : `Monthly SIP needed for ${years} ${years === 1 ? "year" : "years"}`}
          value={formatINR(plan.monthlySip)}
          rows={[
            { label: `Goal cost in ${years} ${years === 1 ? "year" : "years"}`, value: formatINR(plan.futureCost) },
            ...(currentSavings > 0 ? [{ label: "Your savings could grow to", value: formatINR(plan.savingsAtGoal) }] : []),
            { label: "Or invest once, today", value: formatINR(plan.lumpsumToday) },
          ]}
        >
          {covered && <p className="result-card__hint">At these assumptions, your existing savings could cover this goal.</p>}
        </ResultCard>
        {!covered && (
          <GrowthChart
            rows={plan.schedule}
            target={{ value: plan.futureCost, label: "Goal" }}
            caption={`Estimated growth of a ${formatINR(plan.monthlySip)} monthly SIP${currentSavings > 0 ? " plus your existing savings" : ""} towards a goal of ${formatINR(plan.futureCost)} in ${years} years.`}
          />
        )}
        <IllustrativeNote>
          The goal cost rises with the inflation rate you enter. Existing savings are assumed to earn the same return.
        </IllustrativeNote>
      </div>
    </div>
  );
}
