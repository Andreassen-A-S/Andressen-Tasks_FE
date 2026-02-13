"use client";

import { TaskPriority, TaskStatus } from "@/types/task";

interface BasicInfoSectionProps {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    deadline?: string;
    isSubtask: boolean;
    isRecurring: boolean;
    onFieldChange: (field: string, value: string | TaskPriority | TaskStatus | undefined) => void;
    showStatus?: boolean;
    status?: TaskStatus;
}

export default function BasicInfoSection({
    title,
    description,
    priority,
    deadline,
    isSubtask,
    isRecurring,
    onFieldChange,
    showStatus = false,
    status,
}: BasicInfoSectionProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b-2 border-gray-200">
                Opgave Detaljer
            </h3>

            {/* Title */}
            <div>
                <label htmlFor="task-title" className="block text-sm font-semibold text-gray-900 mb-2">
                    Opgave titel<span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="task-title"
                    required
                    value={title}
                    onChange={(e) => onFieldChange('title', e.target.value)}
                    className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                    placeholder="F.eks. Fuldend projekt dokumentation"
                />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="task-description" className="block text-sm font-semibold text-gray-900 mb-2">
                    Beskrivelse<span className="text-red-500">*</span>
                </label>
                <textarea
                    id="task-description"
                    required
                    value={description}
                    onChange={(e) => onFieldChange('description', e.target.value)}
                    rows={4}
                    className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors resize-y"
                    placeholder="Beskriv opgaven i detaljer..."
                />
            </div>

            {/* Priority, Status (optional), & Deadline */}
            <div className={`grid grid-cols-1 ${showStatus ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                <div>
                    <label htmlFor="task-priority" className="block text-sm font-semibold text-gray-900 mb-2">
                        Prioritet
                    </label>
                    <select
                        id="task-priority"
                        value={priority}
                        onChange={(e) => onFieldChange('priority', e.target.value as TaskPriority)}
                        className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                    >
                        <option value={TaskPriority.LOW}>Lav</option>
                        <option value={TaskPriority.MEDIUM}>Mellem</option>
                        <option value={TaskPriority.HIGH}>Høj</option>
                    </select>
                </div>

                {showStatus && status && (
                    <div>
                        <label htmlFor="task-status" className="block text-sm font-semibold text-gray-900 mb-2">
                            Status
                        </label>
                        <select
                            id="task-status"
                            value={status}
                            onChange={(e) => onFieldChange('status', e.target.value as TaskStatus)}
                            className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                        >
                            <option value={TaskStatus.PENDING}>Afventer</option>
                            <option value={TaskStatus.DONE}>Færdig</option>
                            <option value={TaskStatus.REJECTED}>Afvist</option>
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="task-deadline" className="block text-sm font-semibold text-gray-900 mb-2">
                        Deadline<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        id="task-deadline"
                        required
                        value={deadline}
                        onChange={(e) => onFieldChange('deadline', e.target.value)}
                        disabled={isRecurring}
                        className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {isRecurring && (
                        <p className="mt-1 text-xs text-gray-500">
                            Deadline sættes automatisk for hver gentagelse
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}