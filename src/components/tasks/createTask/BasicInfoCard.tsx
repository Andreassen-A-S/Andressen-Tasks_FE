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
    isRecurring,
    onFieldChange,
    showStatus = false,
    status,
}: BasicInfoSectionProps) {
    return (
        <div className="space-y-4">
            <h3 className="overline pt-1">
                Opgave Detaljer
            </h3>

            {/* Title */}
            <div>
                <label htmlFor="task-title" className="label-lg mb-2 block">
                    Opgave titel<span className="text-[#D64545]">*</span>
                </label>
                <input
                    type="text"
                    id="task-title"
                    required
                    value={title}
                    onChange={(e) => onFieldChange('title', e.target.value)}
                    className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md placeholder:text-[#9DA1B4] bg-white focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors"
                    placeholder="F.eks. Fuldend projekt dokumentation"
                />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="task-description" className="label-lg mb-2 block">
                    Beskrivelse<span className="text-[#D64545]">*</span>
                </label>
                <textarea
                    id="task-description"
                    required
                    value={description}
                    onChange={(e) => onFieldChange('description', e.target.value)}
                    rows={4}
                    className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md placeholder:text-[#9DA1B4] bg-white focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors resize-y"
                    placeholder="Beskriv opgaven i detaljer..."
                />
            </div>

            {/* Priority, Status (optional), & Deadline */}
            <div className={`grid grid-cols-1 ${showStatus ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                <div>
                    <label htmlFor="task-priority" className="label-lg mb-2 block">
                        Prioritet
                    </label>
                    <select
                        id="task-priority"
                        value={priority}
                        onChange={(e) => onFieldChange('priority', e.target.value as TaskPriority)}
                        className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md bg-white focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors"
                    >
                        <option value={TaskPriority.LOW}>Lav</option>
                        <option value={TaskPriority.MEDIUM}>Mellem</option>
                        <option value={TaskPriority.HIGH}>Høj</option>
                    </select>
                </div>

                {showStatus && status && (
                    <div>
                        <label htmlFor="task-status" className="label-lg mb-2 block">
                            Status
                        </label>
                        <select
                            id="task-status"
                            value={status}
                            onChange={(e) => onFieldChange('status', e.target.value as TaskStatus)}
                            className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md bg-white focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors"
                        >
                            <option value={TaskStatus.PENDING}>Afventer</option>
                            <option value={TaskStatus.DONE}>Færdig</option>
                            <option value={TaskStatus.REJECTED}>Afvist</option>
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="task-deadline" className="label-lg mb-2 block">
                        Deadline<span className="text-[#D64545]">*</span>
                    </label>
                    <input
                        type="date"
                        id="task-deadline"
                        required
                        value={deadline}
                        onChange={(e) => onFieldChange('deadline', e.target.value)}
                        disabled={isRecurring}
                        className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md bg-white focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors disabled:bg-[#FAFAF7] disabled:cursor-not-allowed"
                    />
                    {isRecurring && (
                        <p className="caption mt-1">
                            Deadline sættes automatisk for hver gentagelse
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}