import type { Metadata } from "next";
import { CalculatorPage } from "../../../components/calculators/CalculatorPage";
import { LumpsumCalculator } from "../../../components/calculators/LumpsumCalculator";

export const metadata: Metadata = {
  title: "Lumpsum Calculator",
  description: "Estimate what a one-time investment could be worth. Illustrative estimates, not a guarantee of returns.",
};

export default function Page() {
  return (
    <CalculatorPage slug="lumpsum">
      <LumpsumCalculator />
    </CalculatorPage>
  );
}
