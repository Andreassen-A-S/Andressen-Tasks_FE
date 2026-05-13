"use client";

import { useAuth } from "@/hooks/useAuth";
import ApplicationSettingsPanel from "./ApplicationSettingsPanel";
import PageHeader from "@/components/common/PageHeader";

export default function SettingsPage() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="min-h-screen">
                <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
                    <p className="body-md text-text-muted">Ingen bruger er indlæst.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Indstillinger"
                subtitle="De få applikationsindstillinger og systemoplysninger der er relevante lige nu."
            />

            <div className="mx-8 mt-3 px-4 sm:px-6 lg:px-8 pb-12 max-w-5xl">
                <ApplicationSettingsPanel user={user} />
            </div>
        </div>
    );
}
