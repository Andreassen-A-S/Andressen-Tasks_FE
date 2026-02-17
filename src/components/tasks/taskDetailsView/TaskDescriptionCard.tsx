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

            <div className="w-full overflow-hidden rounded-lg border border-[#E8E6E1] bg-white">
                {/* Card Header */}
                <div className="bg-[#FAFAF7] px-4 py-2 border-b border-[#E8E6E1] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <span className="label-lg">{creatorName}</span>
                        <span className="body-sm">åbnet</span>
                        <span className="body-sm">
                            {formatRelativeDate(createdAt)}
                        </span>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                    <div className="mb-4">
                        {description ? (
                            <div className="body-md leading-relaxed whitespace-pre-line">
                                {description}
                            </div>
                        ) : (
                            <div className="body-sm italic text-[#9DA1B4]">
                                Ingen beskrivelse tilgængelig
                            </div>
                        )}
                    </div>

                    {showSubtaskButton && (
                        <button
                            onClick={onAddSubtask}
                            className="inline-flex items-center gap-2 bg-[#EBF0FD] hover:bg-[#dbe6fc] text-[#2C5FE0] px-3 py-1.5 rounded-lg font-medium btn-md transition-colors border border-[#E8E6E1]"
                        >
                            + Tilføj underopgave
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}