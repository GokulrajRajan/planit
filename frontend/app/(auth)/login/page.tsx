import type { Metadata } from "next";
import { LoginForm } from "../forms";

export const metadata: Metadata = {
  title: "Log in — Planit",
};

export default function LoginPage() {
  return <LoginForm />;
}
