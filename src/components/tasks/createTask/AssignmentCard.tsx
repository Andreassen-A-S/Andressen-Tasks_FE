import UserSelector from "../updateTaskView/UserSelector";

interface AssignmentCardProps {
    assignedUsers?: string[];
    onAssignedUsersChange: (userIds: string[]) => void;
}

export default function AssignmentCard({
    assignedUsers,
    onAssignedUsersChange,
}: AssignmentCardProps) {
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
        </div>
    );
}