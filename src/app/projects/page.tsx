import type { Metadata } from "next";
import ProjectPage from "@/components/projects/ProjectPage";

export const metadata: Metadata = { title: "Projekter" };

export default function Projects() {
    return <ProjectPage />;
}
