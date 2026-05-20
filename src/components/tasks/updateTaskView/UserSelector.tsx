"use client";

import { useState, useEffect } from "react";
import { formatNumber } from "@/helpers/helpers";
import { getUsers } from "@/lib/api";
import type { User } from "@/types/users";
import InlineLoadingState from "@/components/common/loading/InlineLoadingState";

interface UserSelectorProps {
    selectedUserIds: string[];
    onSelectionChange: (userIds: string[]) => void;
    label?: string;
    maxHeight?: string;
}

export default function UserSelector({
    selectedUserIds,
    onSelectionChange,
    label = "Tildel medarbejdere",
    maxHeight = "max-h-40"
}: UserSelectorProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const fetchedUsers = await getUsers();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    function handleUserSelection(userId: string) {
        const isSelected = selectedUserIds.includes(userId);
        const updatedUsers = isSelected
            ? selectedUserIds.filter(id => id !== userId)
            : [...selectedUserIds, userId];

        onSelectionChange(updatedUsers);
    }

    return (
        <div>
            <label className="label-lg mb-2 block">{label}</label>
            {loading ? (
                <InlineLoadingState label="Indlæser medarbejdere..." />
            ) : (
                <div className={`space-y-2 ${maxHeight} overflow-y-auto border border-border rounded-lg bg-surface p-3`}>
                    {users.length === 0 ? (
                        <div className="body-sm text-text-muted">Ingen medarbejdere tilgængelige</div>
                    ) : (
                        users.map((user) => (
                            <label
                                key={user.user_id}
                                className="flex items-center gap-2 cursor-pointer hover:bg-surface-hover p-2 rounded-lg transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedUserIds.includes(user.user_id)}
                                    onChange={() => handleUserSelection(user.user_id)}
                                    className="rounded border-border text-link focus:ring-2 focus:ring-accent-mid/30 focus:border-accent-mid"
                                />
                                <span className="body-sm">{user.name} <span className="caption">({user.position?.name})</span></span>
                            </label>
                        ))
                    )}
                </div>
            )}
            {selectedUserIds.length > 0 && (
                <div className="caption mt-2 text-text-muted">
                    {formatNumber(selectedUserIds.length)} medarbejder(e) valgt
                </div>
            )}
        </div>
    );
}
