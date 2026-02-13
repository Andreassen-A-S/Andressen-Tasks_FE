"use client";

import { useState, useEffect } from "react";
import { getUsers } from "@/lib/api";
import type { User } from "@/types/users";

interface UserSelectorProps {
    selectedUserIds: string[];
    onSelectionChange: (userIds: string[]) => void;
    label?: string;
    maxHeight?: string;
}

export default function UserSelector({
    selectedUserIds,
    onSelectionChange,
    label = "Assign Users",
    maxHeight = "max-h-40"
}: UserSelectorProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch users on component mount
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
            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                {label}
            </label>
            {loading ? (
                <div className="text-sm text-gray-500">Indlæser medarbejdere...</div>
            ) : (
                <div className={`space-y-2 ${maxHeight} overflow-y-auto border-2 border-gray-200 rounded-md p-3`}>
                    {users.length === 0 ? (
                        <div className="text-sm text-gray-500">Ingen medarbejdere tilgængelige</div>
                    ) : (
                        users.map((user) => (
                            <label key={user.user_id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input
                                    type="checkbox"
                                    checked={selectedUserIds.includes(user.user_id)}
                                    onChange={() => handleUserSelection(user.user_id)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                />
                                <span className="text-sm text-gray-900">
                                    {user.name} ({user.position})
                                </span>
                            </label>
                        ))
                    )}
                </div>
            )}
            {selectedUserIds.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                    {selectedUserIds.length} medarbejder(e) valgt
                </div>
            )}
        </div>
    );
}