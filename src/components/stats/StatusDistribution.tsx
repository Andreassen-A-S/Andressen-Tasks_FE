import type { StatusStats } from "@/types/stats";

interface StatusDistributionProps {
    status: StatusStats;
}

export default function StatusDistribution({ status }: StatusDistributionProps) {
    return (
        <div className="my-6 rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="h3 mb-6">Statusfordeling</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-yellow-50">
                    <p className="h2 text-yellow-600">{status.pending}</p>
                    <p className="label-md text-yellow-700 mt-1">Mangler</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50">
                    <p className="h2 text-blue-600">{status.in_progress}</p>
                    <p className="label-md text-blue-700 mt-1">I gang</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50">
                    <p className="h2 text-green-600">{status.completed}</p>
                    <p className="label-md text-green-700 mt-1">Fuldført</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50">
                    <p className="h2 text-gray-600">{status.archived}</p>
                    <p className="label-md text-gray-700 mt-1">Arkiveret</p>
                </div>
            </div>
        </div>
    );
}
