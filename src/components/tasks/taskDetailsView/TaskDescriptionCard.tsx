import SingleAvatar from "../../common/label/singleAvatar";
import type { User } from "@/types/users";
import { formatRelativeDate } from "@/helpers/helpers";

interface TaskDescriptionCardProps {
    creator: User | null;
    createdAt: string;
    description: string | null;
    showSubtaskButton?: boolean;
    onAddSubtask?: () => void;
}

export default function TaskDescriptionCard({
    creator,
    createdAt,
    description,
    showSubtaskButton = false,
    onAddSubtask,
}: TaskDescriptionCardProps) {
    const creatorName = creator?.name || creator?.email || "Ukendt";

    return (
        <div className="mb-6 z-10 relative flex items-start gap-3">
            <SingleAvatar name={creatorName} size="sm" />

            <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                {/* Card Header (same layout as TaskTimelineComment) */}
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">
                            {creatorName}
                        </span>
                        <span className="text-sm text-gray-500">åbnet</span>
                        <span className="text-sm text-gray-500">
                            {formatRelativeDate(createdAt)}
                        </span>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                    <div className="mb-4">
                        {description ? (
                            <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                                {description}
                            </div>
                        ) : (
                            <div className="text-gray-400 italic text-sm">
                                Ingen beskrivelse tilgængelig
                            </div>
                        )}
                    </div>

                    {showSubtaskButton && (
                        <button
                            onClick={onAddSubtask}
                            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors border border-gray-300"
                        >
                            + Tilføj underopgave
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
