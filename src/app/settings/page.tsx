import type { Metadata } from "next";
import SettingsPage from "@/components/settings/SettingsPage";

export const metadata: Metadata = { title: "Indstillinger" };

export default function Settings() {
    return <SettingsPage />;
}
