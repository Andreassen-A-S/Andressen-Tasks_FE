"use client";

import type { TopPerformer } from "@/types/stats";
import SingleAvatar from "../common/label/singleAvatar";

interface TopPerformersTableProps {
    data: TopPerformer[];
}

export default function TopPerformersTable({ data }: TopPerformersTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-lg border p-6 bg-white border-gray-200">
                <h3 className="h3 mb-4">Toppræstationer</h3>
                <p className="body-md text-center py-8">Ingen præstationsdata tilgængelig</p>
            </div>
        );
    }

    const getMedalIcon = (index: number) => {
        if (index === 0) {
            return (
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">🥇</span>
                </div>
            );
        }
        if (index === 1) {
            return (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-600 font-bold">🥈</span>
                </div>
            );
        }
        if (index === 2) {
            return (
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-bold">🥉</span>
                </div>
            );
        }
        return (
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
            </div>
        );
    };

    return (
        <div className="rounded-lg border p-6 bg-white border-gray-200">
            <h3 className="h3 mb-4">Toppræstationer (Denne måned)</h3>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="table-header text-left py-3 px-2">
                                Placering
                            </th>
                            <th className="table-header text-left py-3 px-4">
                                Bruger
                            </th>
                            <th className="table-header text-right py-3 px-4">
                                Fuldført
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((performer, index) => (
                            <tr
                                key={performer.userId}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="py-4 px-2">
                                    {getMedalIcon(index)}
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <SingleAvatar name={performer.name} size="md" />
                                        <div>
                                            <p className="label-lg">{performer.name}</p>
                                            <p className="label-sm">{performer.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full label-md bg-green-100 text-green-800">
                                        {performer.completedCount}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}