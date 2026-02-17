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
                <div className="body-sm text-[#9DA1B4]">Indlæser medarbejdere...</div>
            ) : (
                <div className={`space-y-2 ${maxHeight} overflow-y-auto border border-[#E8E6E1] rounded-lg bg-white p-3`}>
                    {users.length === 0 ? (
                        <div className="body-sm text-[#9DA1B4]">Ingen medarbejdere tilgængelige</div>
                    ) : (
                        users.map((user) => (
                            <label
                                key={user.user_id}
                                className="flex items-center gap-2 cursor-pointer hover:bg-[#FAFAF7] p-2 rounded-lg transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedUserIds.includes(user.user_id)}
                                    onChange={() => handleUserSelection(user.user_id)}
                                    className="rounded border-[#E8E6E1] text-[#2C5FE0] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:border-[#2D9F6F]"
                                />
                                <span className="body-sm">{user.name} <span className="caption">({user.position})</span></span>
                            </label>
                        ))
                    )}
                </div>
            )}
            {selectedUserIds.length > 0 && (
                <div className="caption mt-2 text-[#6B7084]">
                    {selectedUserIds.length} medarbejder(e) valgt
                </div>
            )}
        </div>
    );
}