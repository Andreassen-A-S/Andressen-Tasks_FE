import type { RecurringStats } from "@/types/stats";
import StatCard from "./StatCard";
import { formatNumber } from "@/helpers/helpers";

interface RecurringStatsCardsProps {
    recurring: RecurringStats;
}

export default function RecurringStatsCards({ recurring }: RecurringStatsCardsProps) {
    return (
        <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                title="Aktive skabeloner"
                value={recurring.active_templates}
                subtitle="Gentagne opgaver"
                variant="default"
                tooltip="Antal gentagende opgaveskabeloner, der i øjeblikket er aktive og genererer nye opgaveinstanser"
            />
            <StatCard
                title="Kommende opgaver"
                value={recurring.upcoming_instances}
                subtitle="Næste 7 dage"
                variant="warning"
                tooltip="Afventende gentagende opgaveinstanser planlagt inden for de næste 7 dage, som ikke er blevet færdiggjort endnu"
            />
            <StatCard
                title="Fuldførelsesrate"
                value={`${formatNumber(recurring.completion_rate)}%`}
                subtitle="Gentagende opgaver"
                variant="success"
                tooltip="Hvor mange procent af alle gentagende opgaveinstanser er blevet færdiggjort. Beregnes som: (Færdige instanser / Totale instanser) × 100"
            />
        </div>
    );
}
