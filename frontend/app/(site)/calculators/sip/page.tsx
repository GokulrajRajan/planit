import type { Metadata } from "next";
import { CalculatorPage } from "../../../components/calculators/CalculatorPage";
import { SipCalculator } from "../../../components/calculators/SipCalculator";

export const metadata: Metadata = {
  title: "SIP Calculator",
  description: "See how a monthly SIP could grow over time. Illustrative estimates, not a guarantee of returns.",
};

export default function Page() {
  return (
    <CalculatorPage slug="sip">
      <SipCalculator />
    </CalculatorPage>
  );
}
