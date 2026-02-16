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
    creationMode,
    onCreationModeChange,
}: AssignmentCardProps) {
    const selectedCount = assignedUsers?.length ?? 0;

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b-2 border-gray-200">
                Tildel til Medarbejdere
            </h3>
            <UserSelector
                selectedUserIds={assignedUsers || []}
                onSelectionChange={onAssignedUsersChange}
                label=""
            />

            {selectedCount >= 2 && onCreationModeChange && (
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <input
                        type="checkbox"
                        checked={creationMode === "individual"}
                        onChange={(e) =>
                            onCreationModeChange(e.target.checked ? "individual" : "combined")
                        }
                        className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <div>
                        <span className="text-sm font-medium text-gray-900">
                            Opret individuelle opgaver
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">
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