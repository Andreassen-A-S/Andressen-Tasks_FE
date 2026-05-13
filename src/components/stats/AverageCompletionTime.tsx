interface AverageCompletionTimeProps {
    days: number;
}

export default function AverageCompletionTime({ days }: AverageCompletionTimeProps) {
    return (
        <div className="my-6 rounded-lg border border-border bg-surface p-6 text-center">
            <p className="label-md text-text-secondary mb-2">Gennemsnitlig fuldførelsestid</p>
            <p className="h1 text-text-primary">
                {days}
                <span className="h4 text-text-secondary ml-2">dage</span>
            </p>
        </div>
    );
}
