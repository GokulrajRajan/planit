"use client";

import { useState } from "react";
import { formatINR, lumpsumSchedule } from "@/lib/calculators";
import { GrowthChart } from "./GrowthChart";
import { RangeField } from "./RangeField";
import { IllustrativeNote, ResultCard, SERIES_SWATCH } from "./Result";

export function LumpsumCalculator() {
  const [amount, setAmount] = useState(100_000);
  const [annualReturn, setAnnualReturn] = useState(10);
  const [years, setYears] = useState(10);

  const rows = lumpsumSchedule({ amount, annualReturn, years });
  const { value } = rows[rows.length - 1];

  return (
    <div className="calc">
      <div className="calc__inputs">
        <RangeField label="Amount invested" unit="rupees" prefix="₹" value={amount} onChange={setAmount} min={1_000} max={10_000_000} step={1_000} />
        <RangeField label="Expected return" unit="percent a year" suffix="% p.a." value={annualReturn} onChange={setAnnualReturn} min={0} max={30} step={0.5} />
        <RangeField label="Time period" unit="years" suffix="years" value={years} onChange={setYears} min={1} max={40} step={1} />
      </div>

      <div className="calc__results">
        <ResultCard
          label={`Estimated value after ${years} ${years === 1 ? "year" : "years"}`}
          value={formatINR(value)}
          rows={[
            { label: "Amount invested", value: formatINR(amount), swatch: SERIES_SWATCH.invested },
            { label: "Estimated gains", value: formatINR(value - amount), swatch: SERIES_SWATCH.gains },
          ]}
        />
        <GrowthChart
          rows={rows}
          caption={`Estimated growth of a one-time investment of ${formatINR(amount)} over ${years} years at ${annualReturn}% a year, reaching ${formatINR(value)}.`}
        />
        <IllustrativeNote>Growth is compounded once a year.</IllustrativeNote>
      </div>
    </div>
  );
}
