import PageContainer from "@/components/layout/PageContainer";

interface StatsErrorStateProps {
    error?: string;
    onRetry: () => void;
}

export default function StatsErrorState({ error, onRetry }: StatsErrorStateProps) {
    return (
        <div className="min-h-screen bg-surface-page">
            <PageContainer className="my-6 px-8 pt-10">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                    <div className="h2 text-red-600 mb-2">
                        {error ? "Kunne ikke hente statistik" : "Ingen statistik tilgængelig"}
                    </div>
                    {error ? (
                        <>
                            <p className="body-md text-red-700 mb-4">{error}</p>
                            <button
                                onClick={onRetry}
                                className="btn-lg px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Prøv igen
                            </button>
                        </>
                    ) : (
                        <p className="body-md text-text-muted">Ingen statistik tilgængelig</p>
                    )}
                </div>
            </PageContainer>
        </div>
    );
}
