interface AverageCompletionTimeProps {
    days: number;
}

export default function AverageCompletionTime({ days }: AverageCompletionTimeProps) {
    return (
        <div className="my-6 rounded-lg border border-gray-200 bg-white p-6 text-center">
            <p className="label-md text-gray-600 mb-2">Gennemsnitlig fuldførelsestid</p>
            <p className="h1 text-gray-900">
                {days}
                <span className="h4 text-gray-600 ml-2">dage</span>
            </p>
        </div>
    );
}
