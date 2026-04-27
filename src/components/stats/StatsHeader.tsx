"use client";

import { faRefresh, faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/common/buttons/Button";

interface StatsHeaderProps {
    onRefresh: () => void;
}

export default function StatsHeader({ onRefresh }: StatsHeaderProps) {
    return (
        <PageHeader
            title="Statistik"
            subtitle="Oversigt over opgaver og aktiviteter"
            action={
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="lg" icon={faUpRightFromSquare} onClick={() => window.open("/dashboard", "_blank")}>
                        Åbn dashboard
                    </Button>
                    <Button variant="ghost" size="lg" icon={faRefresh} onClick={onRefresh}>
                        Opdater
                    </Button>
                </div>
            }
        />
    );
}
