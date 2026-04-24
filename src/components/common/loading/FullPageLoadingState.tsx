import InlineLoadingState from "./InlineLoadingState";

interface FullPageLoadingStateProps {
    label?: string;
}

export default function FullPageLoadingState({ label = "Indlæser..." }: FullPageLoadingStateProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <InlineLoadingState label={label} />
        </div>
    );
}
