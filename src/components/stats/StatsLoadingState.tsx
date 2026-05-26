import PageContainer from "@/components/layout/PageContainer";

export default function StatsLoadingState() {
    return (
        <div className="min-h-screen">
            <PageContainer className="my-6 px-8 pt-10">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-border rounded w-64"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-border rounded-lg"></div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-96 bg-border rounded-lg"></div>
                        <div className="h-96 bg-border rounded-lg"></div>
                    </div>

                    <div className="h-96 bg-border rounded-lg"></div>
                </div>
            </PageContainer>
        </div>
    );
}
