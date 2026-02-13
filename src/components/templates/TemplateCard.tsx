"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarDays,
    faRepeat,
    faClock,
    faPlay,
    faPause,
    faTrash,
    faEye,
    faUsers
} from "@fortawesome/free-solid-svg-icons";
import { RecurringTemplate } from "@/types/recuringTemplate";
import Badge from "@/components/common/label/badge";
import { formatDaDate } from "@/helpers/helpers";

interface TemplateCardProps {
    template: RecurringTemplate;
    onView: () => void;
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
    onToggleActive,
    onDelete
}: TemplateCardProps) {
    const assigneeCount = template.default_assignees?.length || 0;
    const isActive = template.is_active;

    return (
        <div className={`bg-white rounded-lg border-2 h-full flex flex-col ${isActive ? 'border-blue-200' : 'border-gray-200'
            } shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
            {/* Header */}
            <div className={`px-5 py-4 border-b ${isActive ? 'bg-gradient-to-r from-blue-50 to-transparent border-blue-100' : 'bg-gray-50 border-gray-200'
                }`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {template.title}
                        </h3>
                        {template.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {template.description}
                            </p>
                        )}
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {isActive ? 'Aktiv' : 'Inaktiv'}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4 flex-1">
                {/* Priority */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Prioritet</span>
                    <Badge variant="priority" value={template.priority} />
                </div>

                {/* Frequency */}
                <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faRepeat} className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                            {getFrequencyText(template)}
                        </div>
                        {template.days_of_week && Array.isArray(template.days_of_week) && template.days_of_week.length > 0 && (
                            <div className="text-xs text-gray-500 mt-0.5">
                                {template.days_of_week.map(day => {
                                    const days = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
                                    return days[day];
                                }).join(', ')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCalendarDays} className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 text-sm text-gray-600">
                        <div>Start: {formatDaDate(template.start_date)}</div>
                        {template.end_date && (
                            <div>Slut: {formatDaDate(template.end_date)}</div>
                        )}
                        {!template.end_date && (
                            <div className="text-xs text-gray-500 mt-0.5">
                                Fortsætter på ubestemt tid
                            </div>
                        )}
                    </div>
                </div>

                {/* Assignees */}
                {assigneeCount > 0 && (
                    <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-600">
                            {assigneeCount} {assigneeCount === 1 ? 'tildelt bruger' : 'tildelte brugere'}
                        </div>
                    </div>
                )}

                {/* Goal Info */}
                {template.goal_type === 'FIXED' && template.target_quantity && (
                    <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-600">
                            Mål: {template.target_quantity} {template.unit !== 'NONE' && template.unit?.toLowerCase()}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-3 bg-gray-50 border border-gray-200 flex items-center gap-2">
                <button
                    onClick={onView}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                    Se instanser
                </button>

                <button
                    onClick={onToggleActive}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                        ? 'text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200'
                        : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                        }`}
                    title={isActive ? 'Pause skabelon' : 'Aktiver skabelon'}
                >
                    <FontAwesomeIcon icon={isActive ? faPause : faPlay} className="w-4 h-4" />
                </button>

                <button
                    onClick={onDelete}
                    className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                    title="Slet skabelon"
                >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}