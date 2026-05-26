import { useEffect, useState } from "react";
import SingleAvatar from "../../common/label/SingleAvatar";
import UserCard from "@/components/common/UserCard";
import { UserRole } from "@/types/users";
import { formatRelativeDate } from "@/helpers/helpers";
import Button from "@/components/common/buttons/Button";
import { colors } from "@/constants/colors";
import DropdownMenu from "@/components/common/DropdownMenu";
import { Ellipsis, Pencil } from "lucide-react";

interface TaskDescriptionCardProps {
    creator: { name: string | null; role: UserRole } | null;
    creatorId?: string;
    createdAt: string;
    description: string | null;
    showSubtaskButton?: boolean;
    onAddSubtask?: () => void;
    isArchived?: boolean;
    isAuthor?: boolean;
    onSaveDescription?: (description: string) => Promise<void>;
}

export default function TaskDescriptionCard({
    creator,
    creatorId,
    createdAt,
    description,
    showSubtaskButton = false,
    onAddSubtask,
    isArchived = false,
    isAuthor = false,
    onSaveDescription,
}: TaskDescriptionCardProps) {
    const creatorName = creator?.name ?? "Ukendt";
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
            {creatorId
                ? <UserCard userId={creatorId} name={creatorName} actor={creator ? { role: creator.role } : null}><SingleAvatar name={creatorName} size="sm" /></UserCard>
                : <SingleAvatar name={creatorName} size="sm" />
            }

            <div className={`w-full overflow-hidden rounded-lg border bg-background ${isAuthor ? "border-accent/30" : "border-border"}`}>
                {/* Card Header */}
                <div className={`pl-4 pr-1 py-1 flex items-center gap-1 border-b ${isAuthor ? "border-accent/30 bg-accent-surface" : "border-border bg-surface"}`}>
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
                                    <Button variant="ghost" size="sm" icon={<Ellipsis className="w-4 h-4" />} iconOnly tooltip="Mere" />
                                }
                                items={[
                                    {
                                        label: "Rediger",
                                        icon: <Pencil className="w-4 h-4" />,
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
                                    className="w-full body-sm rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
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
                        <Button variant="secondary" size="sm" onClick={onAddSubtask}>
                            + Tilføj underopgave
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
