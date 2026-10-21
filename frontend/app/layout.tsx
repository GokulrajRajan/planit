import type { Metadata } from "next";
import { Jost, Source_Serif_4, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  axes: ["opsz"],
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const futura = Jost({
  variable: "--font-futura",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Planit – Start Early", template: "%s | Planit" },
  description:
    "Planit helps you invest in mutual funds with a clear plan: SIPs, goal planning, retirement and tax-saving investments, explained simply.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn(serif.variable, "font-sans", geist.variable, futura.variable)}>
      <body>{children}</body>
    </html>
  );
}
