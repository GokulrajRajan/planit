import type { Metadata } from "next";
import { CalculatorPage } from "../../../components/calculators/CalculatorPage";
import { GoalCalculator } from "../../../components/calculators/GoalCalculator";

export const metadata: Metadata = {
  title: "Goal Calculator",
  description: "Find the monthly SIP for a future goal. Illustrative estimates, not a guarantee of returns.",
};

export default function Page() {
  return (
    <CalculatorPage slug="goal">
      <GoalCalculator />
    </CalculatorPage>
  );
}
