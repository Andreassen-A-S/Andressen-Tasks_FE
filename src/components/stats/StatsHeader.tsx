"use client";

import { colors } from "@/constants/colors";
import PageContainer from "@/components/layout/PageContainer";

interface StatsHeaderProps {
    title: string;
    subtitle: string;
    periodAction?: React.ReactNode;
}

export default function StatsHeader({ title, subtitle, periodAction }: StatsHeaderProps) {
    return (
        <PageContainer className="px-8 pt-10">
            <div className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-end lg:justify-between" style={{ borderColor: colors.border }}>
                <div>
                    <h1 className="h1">{title}</h1>
                    <p className="mt-1 body-md" style={{ color: colors.textSecondary }}>{subtitle}</p>
                </div>
                {periodAction && <div className="flex items-center gap-2">{periodAction}</div>}
            </div>
        </PageContainer>
    );
}
