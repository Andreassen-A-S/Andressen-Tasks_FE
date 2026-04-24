export default function StatsLoadingState() {
    return (
        <div className="min-h-screen">
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-64"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                    </div>

                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
}
