import { TaskPriority } from "@/types/task";

interface BasicInfoCardProps {
    title: string;
    description: string;
    priority: TaskPriority;
    deadline: string;
    isSubtask: boolean;
    isRecurring: boolean;
    onFieldChange: (field: string, value: any) => void;
}

export default function BasicInfoCard({
    title,
    description,
    priority,
    deadline,
    isSubtask,
    isRecurring,
    onFieldChange,
}: BasicInfoCardProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b-2 border-gray-200">
                Opgave Detaljer
            </h3>

            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                    Opgave titel<span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="title"
                    placeholder="Indtast titel..."
                    required
                    value={title}
                    onChange={(e) => onFieldChange('title', e.target.value)}
                    className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                    Beskrivelse<span className="text-red-500">*</span>
                </label>
                <textarea
                    id="description"
                    required
                    placeholder="Indtast beskrivelse..."
                    value={description}
                    onChange={(e) => onFieldChange('description', e.target.value)}
                    rows={4}
                    className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors resize-y"
                />
            </div>

            {/* Priority & Deadline Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="priority" className="block text-sm font-semibold text-gray-900 mb-2">
                        Prioritet
                    </label>
                    <select
                        id="priority"
                        value={priority}
                        onChange={(e) => onFieldChange('priority', e.target.value as TaskPriority)}
                        className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                    >
                        <option value={TaskPriority.LOW}>Lav</option>
                        <option value={TaskPriority.MEDIUM}>Mellem</option>
                        <option value={TaskPriority.HIGH}>Høj</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="deadline" className="block text-sm font-semibold text-gray-900 mb-2">
                        Deadline<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        id="deadline"
                        required={!isRecurring}
                        disabled={isRecurring}
                        value={deadline}
                        onChange={(e) => onFieldChange('deadline', e.target.value)}
                        className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                    />
                    {isRecurring && (
                        <p className="mt-1 text-xs text-gray-500">
                            Deadline er deaktiveret for gentagende opgaver
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}