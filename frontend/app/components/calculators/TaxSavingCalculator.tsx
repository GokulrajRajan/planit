"use client";

import { useState } from "react";
import { ELSS_DEDUCTION_LIMIT, elssTaxSaving, formatINR, OLD_REGIME_SLABS, yearlySchedule } from "@/lib/calculators";
import { GrowthChart } from "./GrowthChart";
import { RangeField } from "./RangeField";
import { IllustrativeNote, ResultCard, SERIES_SWATCH } from "./Result";

export function TaxSavingCalculator() {
  const [yearly, setYearly] = useState(ELSS_DEDUCTION_LIMIT);
  const [slab, setSlab] = useState<number>(30);
  const [years, setYears] = useState(10);
  const [annualReturn, setAnnualReturn] = useState(10);

  const { eligible, taxSaved } = elssTaxSaving(yearly, slab);
  const rows = yearlySchedule({ yearly, annualReturn, years });
  const { invested, value } = rows[rows.length - 1];

  return (
    <div className="calc">
      <div className="calc__inputs">
        <RangeField label="Yearly ELSS investment" unit="rupees" prefix="₹" value={yearly} onChange={setYearly} min={500} max={500_000} step={500} />
        <fieldset className="calc-field segmented">
          <legend>Your income-tax slab (old regime)</legend>
          <div className="segmented__options">
            {OLD_REGIME_SLABS.map((rate) => (
              <label key={rate}>
                <input type="radio" name="slab" value={rate} checked={slab === rate} onChange={() => setSlab(rate)} />
                <span>{rate}%</span>
              </label>
            ))}
          </div>
        </fieldset>
        <RangeField label="Years you'll keep investing" unit="years" suffix="years" value={years} onChange={setYears} min={3} max={40} step={1} />
        <RangeField label="Expected return" unit="percent a year" suffix="% p.a." value={annualReturn} onChange={setAnnualReturn} min={0} max={30} step={0.5} />
      </div>

      <div className="calc__results">
        <ResultCard
          label="Tax you could save each year"
          value={formatINR(taxSaved)}
          rows={[
            { label: "Investment that qualifies", value: formatINR(eligible) },
            { label: `Invested over ${years} years`, value: formatINR(invested), swatch: SERIES_SWATCH.invested },
            { label: "Estimated gains", value: formatINR(value - invested), swatch: SERIES_SWATCH.gains },
            { label: `Estimated value after ${years} years`, value: formatINR(value) },
          ]}
        >
          {yearly > ELSS_DEDUCTION_LIMIT && (
            <p className="result-card__hint">
              Only {formatINR(ELSS_DEDUCTION_LIMIT)} a year qualifies for the deduction, shared with your other
              eligible investments such as PPF and life insurance premiums.
            </p>
          )}
        </ResultCard>
        <GrowthChart
          rows={rows}
          caption={`Estimated growth of ${formatINR(yearly)} invested in ELSS every year for ${years} years at ${annualReturn}% a year, reaching ${formatINR(value)}.`}
        />
        <IllustrativeNote>
          The deduction applies only under the old tax regime, up to {formatINR(ELSS_DEDUCTION_LIMIT)} a year across
          all eligible investments; tax saved includes the 4% cess but not any surcharge or rebate. Each
          investment is locked in for three years. Tax rules change: please confirm your position with a tax
          professional.
        </IllustrativeNote>
      </div>
    </div>
  );
}
