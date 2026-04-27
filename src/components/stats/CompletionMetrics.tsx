import type { CompletionRates } from "@/types/stats";
import StatCard from "./StatCard";

interface CompletionMetricsProps {
    completion: CompletionRates;
    periodLabel: string;
}

export default function CompletionMetrics({ completion, periodLabel }: CompletionMetricsProps) {
    return (
        <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                title="I dag"
                value={`${completion.today_rate}%`}
                subtitle="Fuldførelsesrate"
                tooltip="Procent af opgaver oprettet i dag, som er blevet færdiggjort. Beregnes som: (Færdige i dag / Oprettet i dag) × 100"
            />
            <StatCard
                title="Denne uge"
                value={`${completion.week_rate}%`}
                subtitle="Fuldførelsesrate"
                tooltip="Færdiggørelsesrate for denne uge (mandag-søndag). Viser hvor mange procent af ugens opgaver der er blevet færdiggjort"
            />
            <StatCard
                title={periodLabel}
                value={`${completion.period_rate}%`}
                subtitle="Fuldførelsesrate"
                tooltip={`Færdiggørelsesrate for ${periodLabel.toLowerCase()}. Beregnes som: (Færdige i perioden / Oprettet i perioden) × 100`}
            />
        </div>
    );
}
