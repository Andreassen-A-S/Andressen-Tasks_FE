import type { ProjectStats } from "@/types/stats";
import ProjectProblemTable from "./ProjectProblemTable";

interface ProjectStatsTabProps {
    data: ProjectStats[];
    periodLabel: string;
}

export default function ProjectStatsTab({ data, periodLabel }: ProjectStatsTabProps) {
    return <ProjectProblemTable data={data} periodLabel={periodLabel} />;
}
