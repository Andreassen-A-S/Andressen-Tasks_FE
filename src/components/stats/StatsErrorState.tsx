interface StatsErrorStateProps {
    error?: string;
    onRetry: () => void;
}

export default function StatsErrorState({ error, onRetry }: StatsErrorStateProps) {
    return (
        <div className="min-h-screen bg-white">
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
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
                        <p className="body-md text-gray-500">Ingen statistik tilgængelig</p>
                    )}
                </div>
            </div>
        </div>
    );
}
