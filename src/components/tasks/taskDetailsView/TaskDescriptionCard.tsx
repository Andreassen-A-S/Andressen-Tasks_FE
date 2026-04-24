import { useEffect, useState } from "react";
import SingleAvatar from "../../common/label/SingleAvatar";
import type { User } from "@/types/users";
import { formatRelativeDate } from "@/helpers/helpers";
import Button from "@/components/common/buttons/Button";
import { colors } from "@/constants/colors";
import DropdownMenu from "@/components/common/DropdownMenu";
import { faEllipsis, faPencil } from "@fortawesome/free-solid-svg-icons";

interface TaskDescriptionCardProps {
    creator: User | null;
    createdAt: string;
    description: string | null;
    showSubtaskButton?: boolean;
    onAddSubtask?: () => void;
    isArchived?: boolean;
    onSaveDescription?: (description: string) => Promise<void>;
}

export default function TaskDescriptionCard({
    creator,
    createdAt,
    description,
    showSubtaskButton = false,
    onAddSubtask,
    isArchived = false,
    onSaveDescription,
}: TaskDescriptionCardProps) {
    const creatorName = creator?.name || creator?.email || "Ukendt";
    const [isEditing, setIsEditing] = useState(false);
    const [draftDescription, setDraftDescription] = useState(description ?? "");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setDraftDescription(description ?? "");
        }
    }, [description, isEditing]);

    function handleCancel() {
        setDraftDescription(description ?? "");
        setIsEditing(false);
    }

    async function handleSave() {
        if (!onSaveDescription || isSaving) return;
        setIsSaving(true);
        try {
            await onSaveDescription(draftDescription.trim());
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="mb-6 z-10 relative flex items-start gap-3">
            <SingleAvatar name={creatorName} size="sm" />

            <div className="w-full overflow-hidden rounded-lg border bg-white" style={{ borderColor: colors.border }}>
                {/* Card Header */}
                <div className="pl-4 pr-1 py-1 border-b flex items-center gap-1" style={{ backgroundColor: colors.whiteHover, borderColor: colors.border }}>
                    <div className="flex items-center gap-1 min-w-0">
                        <span className="label-lg">{creatorName}</span>
                        <span className="body-xs">åbnet</span>
                        <span className="body-xs">
                            {formatRelativeDate(createdAt)}
                        </span>
                    </div>
                    <div className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center">
                        {!isArchived && onSaveDescription && !isEditing && (
                            <DropdownMenu
                                trigger={
                                    <Button variant="ghost" size="sm" icon={faEllipsis} iconOnly tooltip="Mere" />
                                }
                                items={[
                                    {
                                        label: "Rediger",
                                        icon: faPencil,
                                        onClick: () => setIsEditing(true),
                                    },
                                ]}
                            />
                        )}
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                    <div className={isEditing ? "" : "mb-4"}>
                        {isEditing ? (
                            <div className="-mx-4 -my-4 p-2 space-y-1">
                                <textarea
                                    className="w-full body-sm rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#0f6e56] transition-colors"
                                    style={{ border: `1px solid ${colors.border}`, color: colors.textPrimary, minHeight: 80 }}
                                    value={draftDescription}
                                    onChange={(e) => setDraftDescription(e.target.value)}
                                    placeholder="Tilføj en beskrivelse"
                                    rows={5}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") handleCancel();
                                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
                                    }}
                                />
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="secondary" size="md" onClick={handleCancel} disabled={isSaving}>
                                        Annuller
                                    </Button>
                                    <Button variant="primary" size="md" onClick={handleSave} loading={isSaving}>
                                        Gem
                                    </Button>
                                </div>
                            </div>
                        ) : description ? (
                            <div className="body-md leading-relaxed whitespace-pre-line">
                                {description}
                            </div>
                        ) : (
                            <div className="body-sm italic" style={{ color: colors.textMuted }}>
                                Ingen beskrivelse tilgængelig
                            </div>
                        )}
                    </div>

                    {showSubtaskButton && !isArchived && !isEditing && (
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
