import UserSelector from "../updateTaskView/UserSelector";

export type CreationMode = "combined" | "individual";

interface AssignmentCardProps {
    assignedUsers?: string[];
    onAssignedUsersChange: (userIds: string[]) => void;
    creationMode?: CreationMode;
    onCreationModeChange?: (mode: CreationMode) => void;
}

export default function AssignmentCard({
    assignedUsers,
    onAssignedUsersChange,
    creationMode = "combined",
    onCreationModeChange,
}: AssignmentCardProps) {
    const selectedCount = assignedUsers?.length ?? 0;

    return (
        <div className="space-y-4">
            <h3 className="overline pt-1">
                Tildel til Medarbejdere
            </h3>
            <UserSelector
                selectedUserIds={assignedUsers || []}
                onSelectionChange={onAssignedUsersChange}
                label=""
            />

            {selectedCount >= 2 && onCreationModeChange && (
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-[#FAFAF7] rounded-lg border border-[#E8E6E1] hover:bg-[#EBF0FD] transition-colors">
                    <input
                        type="checkbox"
                        checked={creationMode === "individual"}
                        onChange={(e) =>
                            onCreationModeChange(e.target.checked ? "individual" : "combined")
                        }
                        className="mt-0.5 rounded border-[#E8E6E1] text-[#2C5FE0] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:border-[#2D9F6F]"
                    />
                    <div>
                        <span className="label-lg">
                            Opret individuelle opgaver
                        </span>
                        <p className="caption mt-0.5">
                            {creationMode === "individual"
                                ? `Opretter ${selectedCount} separate opgaver — én per medarbejder`
                                : "Opretter én fælles opgave delt af alle valgte medarbejdere"}
                        </p>
                    </div>
                </label>
            )}
        </div>
    );
}