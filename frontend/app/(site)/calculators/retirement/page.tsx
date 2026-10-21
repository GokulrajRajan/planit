import type { Metadata } from "next";
import { CalculatorPage } from "../../../components/calculators/CalculatorPage";
import { RetirementCalculator } from "../../../components/calculators/RetirementCalculator";

export const metadata: Metadata = {
  title: "Retirement Calculator",
  description: "Estimate your retirement corpus and the monthly SIP to build it. Illustrative estimates, not a guarantee of returns.",
};

export default function Page() {
  return (
    <CalculatorPage slug="retirement">
      <RetirementCalculator />
    </CalculatorPage>
  );
}
