"use client";

import { useAuth } from "@/hooks/useAuth";
import ApplicationSettingsPanel from "./ApplicationSettingsPanel";
import PageHeader from "@/components/common/PageHeader";
import PageContainer from "@/components/layout/PageContainer";

export default function SettingsPage() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="min-h-screen">
                <PageContainer className="my-6 px-8 pt-10">
                    <p className="body-md text-text-muted">Ingen bruger er indlæst.</p>
                </PageContainer>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Indstillinger"
                subtitle="De få applikationsindstillinger og systemoplysninger der er relevante lige nu."
            />

            <PageContainer className="mt-3 px-8 pb-12" size="narrow">
                <ApplicationSettingsPanel user={user} />
            </PageContainer>
        </div>
    );
}
