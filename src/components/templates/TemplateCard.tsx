"use client";

import {
    faEllipsis,
    faPause,
    faPenToSquare,
    faPlay,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { RecurringTemplate } from "@/types/recuringTemplate";
import Badge from "@/components/common/label/Badge";
import { formatDate, formatNumber } from "@/helpers/helpers";
import Button from "@/components/common/buttons/Button";
import { colors } from "@/constants/colors";
import DropdownMenu from "@/components/common/DropdownMenu";

interface TemplateCardProps {
    template: RecurringTemplate;
    onView: () => void;
    onEdit: () => void;
    onToggleActive: () => void;
    onDelete: () => void;
}

function getFrequencyText(template: RecurringTemplate): string {
    const { frequency, interval } = template;

    const frequencyMap: Record<string, string> = {
        DAILY: interval === 1 ? 'Daglig' : `Hver ${interval}. dag`,
        WEEKLY: interval === 1 ? 'Ugentlig' : `Hver ${interval}. uge`,
        MONTHLY: interval === 1 ? 'Månedlig' : `Hver ${interval}. måned`,
        YEARLY: interval === 1 ? 'Årlig' : `Hvert ${interval}. år`,
    };

    return frequencyMap[frequency] || frequency;
}

export default function TemplateCard({
    template,
    onView,
    onEdit,
    onToggleActive,
    onDelete
}: TemplateCardProps) {
    const assigneeCount = template.default_assignees?.length || 0;
    const isActive = template.is_active;

    return (
        <div
            className="h-full flex flex-col overflow-hidden rounded-lg"
            style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
        >
            <div className="px-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="h3 truncate" style={{ color: colors.textPrimary }}>
                            {template.title}
                        </h3>
                        {template.description && (
                            <p className="body-sm mt-1 line-clamp-2" style={{ color: colors.textSecondary }}>
                                {template.description}
                            </p>
                        )}
                    </div>
                    <span
                        className="badge badge-md inline-flex items-center h-6 px-2 rounded-full whitespace-nowrap"
                        style={{
                            backgroundColor: isActive ? colors.greenLight : colors.muted,
                            color: isActive ? colors.greenMid : colors.textMuted,
                        }}
                    >
                        {isActive ? "Aktiv" : "Inaktiv"}
                    </span>
                </div>

            </div>

            <div className="px-4 pb-4 flex-1">
                <div style={{ borderTop: `1px solid ${colors.border}` }} />

                <div className="flex items-center justify-between py-3">
                    <span className="body-sm" style={{ color: colors.textSecondary }}>Frekvens</span>
                    <span className="label-md" style={{ color: colors.textPrimary }}>
                        {getFrequencyText(template)}
                    </span>
                </div>

                <div className="flex items-center justify-between py-3" style={{ borderTop: `1px solid ${colors.muted}` }}>
                    <span className="body-sm" style={{ color: colors.textSecondary }}>Prioritet</span>
                    <Badge variant="priority" size="md" value={template.priority} />
                </div>

                {assigneeCount > 0 && (
                    <div className="flex items-center justify-between py-3" style={{ borderTop: `1px solid ${colors.muted}` }}>
                        <span className="body-sm" style={{ color: colors.textSecondary }}>Tildelt</span>
                        <span className="label-md" style={{ color: colors.textPrimary }}>
                            {assigneeCount} {assigneeCount === 1 ? 'bruger' : 'brugere'}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between py-3" style={{ borderTop: `1px solid ${colors.muted}` }}>
                    <span className="body-sm" style={{ color: colors.textSecondary }}>Start</span>
                    <span className="label-md" style={{ color: colors.textPrimary }}>
                        {formatDate(template.start_date)}
                    </span>
                </div>

                {template.end_date && (
                    <div className="flex items-center justify-between py-3" style={{ borderTop: `1px solid ${colors.muted}` }}>
                        <span className="body-sm" style={{ color: colors.textSecondary }}>Slut</span>
                        <span className="label-md" style={{ color: colors.textPrimary }}>
                            {formatDate(template.end_date)}
                        </span>
                    </div>
                )}

                {template.goal_type === 'FIXED' && template.target_quantity && (
                    <div className="flex items-center justify-between py-3" style={{ borderTop: `1px solid ${colors.muted}` }}>
                        <span className="body-sm" style={{ color: colors.textSecondary }}>Mål</span>
                        <span className="label-md" style={{ color: colors.textPrimary }}>
                            {formatNumber(template.target_quantity)} {template.unit !== 'NONE' && template.unit?.toLowerCase()}
                        </span>
                    </div>
                )}
            </div>

            <div
                className="px-4 py-2 border-t grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5"
                style={{ borderColor: colors.border }}
            >
                <Button
                    onClick={onView}
                    variant="secondary"
                    fullWidth
                    className="rounded-md"
                >
                    Se instanser
                </Button>

                <DropdownMenu
                    trigger={
                        <Button
                            variant="secondary"
                            size="md"
                            icon={faEllipsis}
                            iconOnly
                            className="rounded-md"
                            tooltip="Handlinger"
                        />
                    }
                    items={[
                        {
                            label: "Rediger skabelon",
                            icon: faPenToSquare,
                            onClick: onEdit,
                        },
                        {
                            label: isActive ? "Pause skabelon" : "Aktiver skabelon",
                            icon: isActive ? faPause : faPlay,
                            onClick: onToggleActive,
                        },
                        {
                            label: "Slet skabelon",
                            icon: faTrash,
                            onClick: onDelete,
                            danger: true,
                            dividerBefore: true,
                        },
                    ]}
                />
            </div>
        </div>
    );
}
