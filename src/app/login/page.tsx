import type { Metadata } from "next";
import LoginPage from "@/components/auth/LoginPage";

export const metadata: Metadata = { title: "Log ind" };

export default function Login() {
    return <LoginPage />;
}