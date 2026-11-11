import type { Metadata } from "next";
import { CalculatorPage } from "../../../components/calculators/CalculatorPage";
import { EmiCalculator } from "../../../components/calculators/EmiCalculator";

export const metadata: Metadata = {
  title: "EMI Calculator",
  description: "Work out the monthly EMI, total interest and repayment schedule of a loan. Illustrative estimates only.",
};

export default function Page() {
  return (
    <CalculatorPage slug="emi">
      <EmiCalculator />
    </CalculatorPage>
  );
}
