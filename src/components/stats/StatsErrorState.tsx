import PageContainer from "@/components/layout/PageContainer";
import Banner from "@/components/common/Banner";
import Button from "@/components/common/buttons/Button";

interface StatsErrorStateProps {
    error?: string;
    onRetry: () => void;
}

export default function StatsErrorState({ error, onRetry }: StatsErrorStateProps) {
    return (
        <div className="min-h-screen bg-surface-page">
            <PageContainer className="my-6 px-8 pt-10">
                {error ? (
                    <Banner
                        variant="warning"
                        title="Kunne ikke hente statistik"
                        description={error}
                        action={<Button variant="secondary" onClick={onRetry}>Prøv igen</Button>}
                    />
                ) : (
                    <p className="body-md text-text-muted text-center">Ingen statistik tilgængelig</p>
                )}
            </PageContainer>
        </div>
    );
}
