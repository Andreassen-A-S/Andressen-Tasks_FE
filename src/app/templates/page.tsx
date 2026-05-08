import type { Metadata } from "next";
import TemplatePage from "@/components/templates/TemplatePage";

export const metadata: Metadata = { title: "Gentagende opgaver" };

export default function Template() {
    return <TemplatePage />;
}