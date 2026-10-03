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
  title: "Planit — Write more. Reach more.",
  description: "Planit is the calm, beautiful home for everything you write and publish.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn(serif.variable, "font-sans", geist.variable, futura.variable)}>
      <body>{children}</body>
    </html>
  );
}
