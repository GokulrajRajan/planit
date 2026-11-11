"use client";

import { useState } from "react";
import { formatINR, loanPlan } from "@/lib/calculators";
import { RangeField } from "./RangeField";
import { ResultCard } from "./Result";

export function EmiCalculator() {
  const [principal, setPrincipal] = useState(1_000_000);
  const [annualRate, setAnnualRate] = useState(10);
  const [years, setYears] = useState(5);

  const plan = loanPlan({ principal, annualRate, years });

  return (
    <div className="calc">
      <div className="calc__inputs">
        <RangeField label="Loan amount" unit="rupees" prefix="₹" value={principal} onChange={setPrincipal} min={10_000} max={50_000_000} step={10_000} />
        <RangeField label="Interest rate" unit="percent a year" suffix="% p.a." value={annualRate} onChange={setAnnualRate} min={1} max={30} step={0.1} />
        <RangeField label="Loan tenure" unit="years" suffix="years" value={years} onChange={setYears} min={1} max={30} step={1} />
      </div>

      <div className="calc__results">
        <ResultCard
          label="Monthly EMI"
          value={formatINR(plan.emi)}
          rows={[
            { label: "Loan amount", value: formatINR(principal) },
            { label: "Total interest", value: formatINR(plan.totalInterest) },
            { label: "Total amount payable", value: formatINR(plan.totalPayment) },
          ]}
        />

        <details className="chart-table">
          <summary>View year-by-year repayment table</summary>
          <div className="chart-table__scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  <th scope="col">Principal paid</th>
                  <th scope="col">Interest paid</th>
                  <th scope="col">Balance</th>
                </tr>
              </thead>
              <tbody>
                {plan.schedule.map((row) => (
                  <tr key={row.year}>
                    <th scope="row">{row.year}</th>
                    <td>{formatINR(row.principal)}</td>
                    <td>{formatINR(row.interest)}</td>
                    <td>{formatINR(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <p className="note">
          <strong>Illustrative only.</strong> This assumes the interest rate stays the same for the whole tenure, with
          interest charged monthly on the reducing balance. Your actual EMI depends on the lender&rsquo;s rate,
          processing fees and terms, and floating rates can change during the loan.
        </p>
      </div>
    </div>
  );
}
