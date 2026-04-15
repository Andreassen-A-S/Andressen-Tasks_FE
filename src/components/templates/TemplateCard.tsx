"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay,
    faPause,
    faTrash,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { RecurringTemplate } from "@/types/recuringTemplate";
import Badge from "@/components/common/label/badge";
import { formatDate } from "@/helpers/helpers";

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
        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col transition-shadow duration-200 hover:shadow-md overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="h5 truncate text-gray-900">
                            {template.title}
                        </h3>
                        {template.description && (
                            <p className="body-xs mt-1 text-gray-400 line-clamp-2">
                                {template.description}
                            </p>
                        )}
                    </div>
                    <span className={`badge px-2.5 py-0.5 rounded-full whitespace-nowrap ${isActive
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                        }`}>
                        {isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                </div>
            </div>

            {/* Body — simple row layout */}
            <div className="px-6 pb-5 flex-1">
                <div className="border-t border-gray-200" />

                {/* Frequency */}
                <div className="flex items-center justify-between py-3">
                    <span className="body-xs text-gray-500">Frekvens</span>
                    <span className="label-md text-gray-900">
                        {getFrequencyText(template)}
                    </span>
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <span className="body-xs text-gray-500">Prioritet</span>
                    <Badge variant="priority" value={template.priority} />
                </div>

                {/* Assignees */}
                {assigneeCount > 0 && (
                    <div className="flex items-center justify-between py-3 border-t border-gray-100">
                        <span className="body-xs text-gray-500">Tildelt</span>
                        <span className="label-md text-gray-900">
                            {assigneeCount} {assigneeCount === 1 ? 'bruger' : 'brugere'}
                        </span>
                    </div>
                )}

                {/* Start date */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <span className="body-xs text-gray-500">Start</span>
                    <span className="label-md text-gray-900">
                        {formatDate(template.start_date)}
                    </span>
                </div>

                {/* End date (only if set) */}
                {template.end_date && (
                    <div className="flex items-center justify-between py-3 border-t border-gray-100">
                        <span className="body-xs text-gray-500">Slut</span>
                        <span className="label-md text-gray-900">
                            {formatDate(template.end_date)}
                        </span>
                    </div>
                )}

                {/* Goal (only if fixed) */}
                {template.goal_type === 'FIXED' && template.target_quantity && (
                    <div className="flex items-center justify-between py-3 border-t border-gray-100">
                        <span className="body-xs text-gray-500">Mål</span>
                        <span className="label-md text-gray-900">
                            {template.target_quantity} {template.unit !== 'NONE' && template.unit?.toLowerCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-3.5 border-t border-gray-200 flex items-center gap-2">
                <button
                    onClick={onView}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-3 btn-md text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    Se instanser
                </button>

                <button
                    onClick={onEdit}
                    className="px-3 py-3 btn-md text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                    title="Rediger skabelon"
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                </button>

                <button
                    onClick={onToggleActive}
                    className={"px-3 py-3 btn-md rounded-lg transition-colors cursor-pointer text-gray-500 hover:bg-gray-100 border border-gray-200"}
                    title={isActive ? 'Pause skabelon' : 'Aktiver skabelon'}
                >
                    <FontAwesomeIcon icon={isActive ? faPause : faPlay} className="w-3.5 h-3.5" />
                </button>

                <button
                    onClick={onDelete}
                    className="px-3 py-3 btn-md text-red-500 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                    title="Slet skabelon"
                >
                    <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}