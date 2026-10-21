import type { Metadata } from "next";
import { CalculatorPage } from "../../../components/calculators/CalculatorPage";
import { TaxSavingCalculator } from "../../../components/calculators/TaxSavingCalculator";

export const metadata: Metadata = {
  title: "Tax Saving Calculator",
  description: "See how much tax ELSS investments could save under the old regime. Illustrative estimates, not a guarantee of returns.",
};

export default function Page() {
  return (
    <CalculatorPage slug="tax-saving">
      <TaxSavingCalculator />
    </CalculatorPage>
  );
}
