import type { Metadata } from "next";
import { RegisterForm } from "../forms";

export const metadata: Metadata = {
  title: "Create your account — Planit",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
