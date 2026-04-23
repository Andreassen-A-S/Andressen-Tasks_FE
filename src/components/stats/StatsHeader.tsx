"use client";

import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PageHeader from "@/components/common/PageHeader";

interface StatsHeaderProps {
    onRefresh: () => void;
}

export default function StatsHeader({ onRefresh }: StatsHeaderProps) {
    return (
        <PageHeader
            title="Statistik"
            subtitle="Oversigt over opgaver og aktiviteter"
            action={
                <button
                    onClick={onRefresh}
                    className="inline-flex btn-lg bg-transparent text-gray-500 border border-gray-200 hover:border-gray-300 items-center gap-2 px-5 py-3 font-semibold rounded-lg transition-colors"
                >
                    <FontAwesomeIcon icon={faRefresh} size="sm" />
                    Opdater
                </button>
            }
        />
    );
}
