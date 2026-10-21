"use client";

import { useState } from "react";
import { formatINR, sipSchedule } from "@/lib/calculators";
import { GrowthChart } from "./GrowthChart";
import { RangeField } from "./RangeField";
import { IllustrativeNote, ResultCard, SERIES_SWATCH } from "./Result";

export function SipCalculator() {
  const [monthly, setMonthly] = useState(10_000);
  const [annualReturn, setAnnualReturn] = useState(10);
  const [years, setYears] = useState(10);
  const [stepUp, setStepUp] = useState(0);

  const rows = sipSchedule({ monthly, annualReturn, years, stepUp });
  const { invested, value } = rows[rows.length - 1];

  return (
    <div className="calc">
      <div className="calc__inputs">
        <RangeField label="Monthly investment" unit="rupees" prefix="₹" value={monthly} onChange={setMonthly} min={500} max={1_000_000} step={500} />
        <RangeField label="Expected return" unit="percent a year" suffix="% p.a." value={annualReturn} onChange={setAnnualReturn} min={0} max={30} step={0.5} />
        <RangeField label="Time period" unit="years" suffix="years" value={years} onChange={setYears} min={1} max={40} step={1} />
        <RangeField label="Annual step-up" unit="percent a year" suffix="%" value={stepUp} onChange={setStepUp} min={0} max={25} step={1} />
      </div>

      <div className="calc__results">
        <ResultCard
          label={`Estimated value after ${years} ${years === 1 ? "year" : "years"}`}
          value={formatINR(value)}
          rows={[
            { label: "Amount invested", value: formatINR(invested), swatch: SERIES_SWATCH.invested },
            { label: "Estimated gains", value: formatINR(value - invested), swatch: SERIES_SWATCH.gains },
          ]}
        />
        <GrowthChart
          rows={rows}
          caption={`Estimated growth of a ${formatINR(monthly)} monthly SIP over ${years} years at ${annualReturn}% a year, reaching ${formatINR(value)}.`}
        />
        <IllustrativeNote>Instalments are assumed to be invested at the start of each month.</IllustrativeNote>
      </div>
    </div>
  );
}
