"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faCalendarDays,
    faSpinner,
    faCheckCircle,
    faCircle,
    faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import { RecurringTemplate } from "@/types/recuringTemplate";
import { Task } from "@/types/task";
import { getTemplateInstances } from "@/lib/api";
import { formatDaDate, formatRelativeDate } from "@/helpers/helpers";
import Badge from "@/components/common/label/badge";

interface ViewTemplateModalProps {
    template: RecurringTemplate;
    onClose: () => void;
    onUpdate: (template: RecurringTemplate) => void;
}

export default function ViewTemplateModal({ template, onClose, onUpdate }: ViewTemplateModalProps) {
    const [instances, setInstances] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadInstances();
    }, [template.id]);

    async function loadInstances() {
        try {
            setLoading(true);
            const data = await getTemplateInstances(template.id);
            setInstances(data);
        } catch (err) {
            setError("Kunne ikke indlæse opgave instanser");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function getFrequencyText(): string {
        const { frequency, interval } = template;

        const frequencyMap: Record<string, string> = {
            DAILY: interval === 1 ? 'Daglig' : `Hver ${interval}. dag`,
            WEEKLY: interval === 1 ? 'Ugentlig' : `Hver ${interval}. uge`,
            MONTHLY: interval === 1 ? 'Månedlig' : `Hver ${interval}. måned`,
            YEARLY: interval === 1 ? 'Årlig' : `Hvert ${interval}. år`,
        };

        return frequencyMap[frequency] || frequency;
    }

    const completedCount = instances.filter(i => i.status === 'DONE').length;
    const pendingCount = instances.filter(i => i.status === 'PENDING').length;
    const rejectedCount = instances.filter(i => i.status === 'REJECTED').length;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/30 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    {template.title}
                                </h2>
                                {template.description && (
                                    <p className="text-sm text-gray-600 mb-3">
                                        {template.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCalendarDays} className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{getFrequencyText()}</span>
                                    </div>
                                    <Badge variant="priority" value={template.priority} />
                                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${template.is_active
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {template.is_active ? 'Aktiv' : 'Inaktiv'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    <span className="text-2xl font-bold">{completedCount}</span>
                                </div>
                                <div className="text-xs text-gray-500">Afsluttet</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                                    <FontAwesomeIcon icon={faCircle} />
                                    <span className="text-2xl font-bold">{pendingCount}</span>
                                </div>
                                <div className="text-xs text-gray-500">Afventer</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-red-600 mb-1">
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                    <span className="text-2xl font-bold">{rejectedCount}</span>
                                </div>
                                <div className="text-xs text-gray-500">Annulleret</div>
                            </div>
                        </div>
                    </div>

                    {/* Instances List */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-blue-600 animate-spin" />
                                    <div className="text-sm text-gray-500">Indlæser instanser...</div>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        ) : instances.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Ingen instanser fundet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    Opgave Instanser ({instances.length})
                                </h3>
                                {instances.map(instance => (
                                    <div
                                        key={instance.task_id}
                                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {instance.occurrence_date && formatDaDate(instance.occurrence_date)}
                                                </div>
                                                <Badge variant="status" value={instance.status} />
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Deadline: {formatRelativeDate(instance.deadline)}
                                            </div>
                                        </div>
                                        {instance.target_quantity && instance.goal_type === 'FIXED' && (
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-700">
                                                    {instance.current_quantity}/{instance.target_quantity}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {Math.round((instance.current_quantity! / instance.target_quantity) * 100)}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <div>
                                Oprettet: {formatDaDate(template.created_at)}
                            </div>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Luk
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}