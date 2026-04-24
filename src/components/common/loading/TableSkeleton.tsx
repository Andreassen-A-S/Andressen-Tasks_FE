import { colors } from "@/constants/colors";

interface TableSkeletonProps {
    columns?: number;
    rows?: number;
    showToolbar?: boolean;
}

export default function TableSkeleton({
    columns = 5,
    rows = 6,
    showToolbar = false,
}: TableSkeletonProps) {
    return (
        <div
            className="rounded-md border overflow-hidden bg-white animate-pulse"
            style={{ borderColor: colors.border }}
        >
            {showToolbar && (
                <div
                    className="flex items-center justify-between px-4 py-2 border-b"
                    style={{ borderColor: colors.border }}
                >
                    <div className="h-5 w-28 rounded" style={{ backgroundColor: colors.muted }} />
                    <div className="h-8 w-28 rounded-md" style={{ backgroundColor: colors.muted }} />
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b" style={{ backgroundColor: colors.muted, borderColor: colors.border }}>
                        <tr>
                            {Array.from({ length: columns }).map((_, index) => (
                                <th key={index} className="px-6 py-2.5">
                                    <div className="h-4 rounded" style={{ backgroundColor: colors.white }} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex > 0 ? "border-t" : undefined} style={{ borderColor: colors.muted }}>
                                {Array.from({ length: columns }).map((__, colIndex) => (
                                    <td key={colIndex} className="px-6 py-3">
                                        <div
                                            className="h-4 rounded"
                                            style={{
                                                backgroundColor: colors.muted,
                                                width: colIndex === 0 ? "70%" : colIndex === columns - 1 ? "50%" : "60%",
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
