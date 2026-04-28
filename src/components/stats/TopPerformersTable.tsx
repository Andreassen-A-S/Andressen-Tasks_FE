"use client";

import type { TopPerformer } from "@/types/stats";
import SingleAvatar from "../common/label/SingleAvatar";
import { colors } from "@/constants/colors";
import DataTable from "@/components/common/table/DataTable";
import { formatNumber } from "@/helpers/helpers";

interface TopPerformersTableProps {
    data: TopPerformer[];
    periodLabel: string;
}

const columns = [
    { key: "rank", header: "Rang", className: "w-20 px-5 py-2.5 label-sm" },
    { key: "user", header: "Bruger", className: "px-5 py-2.5 label-sm min-w-[260px]" },
    { key: "completed", header: "Fuldført", className: "px-5 py-2.5 label-sm text-right" },
];

export default function TopPerformersTable({ data, periodLabel }: TopPerformersTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-lg border p-5" style={{ borderColor: colors.border, backgroundColor: colors.white }}>
                <h3 className="h4 mb-4">Leaderboard</h3>
                <p className="body-md text-center py-8" style={{ color: colors.textMuted }}>Ingen præstationsdata tilgængelig</p>
            </div>
        );
    }

    const totalCompleted = data.reduce((sum, performer) => sum + performer.completed_count, 0);

    return (
        <DataTable
            columns={columns}
            toolbar={
                <>
                    <div>
                        <h3 className="h4">Leaderboard</h3>
                        <p className="body-sm" style={{ color: colors.textMuted }}>Flest afsluttede opgaver {periodLabel.toLowerCase()}</p>
                    </div>
                    <div className="label-md" style={{ color: colors.textSecondary }}>
                        {formatNumber(totalCompleted)} fuldførte opgaver
                    </div>
                </>
            }
        >
            {data.map((performer, index) => (
                <tr key={performer.user_id}>
                    <td className="px-5 py-4">
                        <span
                            className="inline-flex h-7 min-w-9 items-center justify-center rounded-full border px-2 label-md"
                            style={{
                                backgroundColor: index === 0 ? colors.greenLight : colors.white,
                                borderColor: index === 0 ? colors.green : colors.border,
                                color: index === 0 ? colors.green : colors.textSecondary,
                            }}
                        >
                            #{index + 1}
                        </span>
                    </td>
                    <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                            <SingleAvatar name={performer.name} size="md" />
                            <div className="min-w-0">
                                <p className="label-lg truncate" style={{ color: colors.textPrimary }}>{performer.name}</p>
                                <p className="label-sm truncate" style={{ color: colors.textMuted }}>{performer.email}</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                        <span className="label-lg" style={{ color: colors.textPrimary }}>{formatNumber(performer.completed_count)}</span>
                    </td>
                </tr>
            ))}
        </DataTable>
    );
}
