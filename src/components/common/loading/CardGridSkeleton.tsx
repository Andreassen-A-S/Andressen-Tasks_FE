import { colors } from "@/constants/colors";

interface CardGridSkeletonProps {
    cards?: number;
}

export default function CardGridSkeleton({ cards = 6 }: CardGridSkeletonProps) {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 animate-pulse">
            {Array.from({ length: cards }).map((_, index) => (
                <div
                    key={index}
                    className="rounded-lg border bg-surface p-5 space-y-4"
                    style={{ borderColor: colors.border }}
                >
                    <div className="space-y-2">
                        <div className="h-5 w-2/3 rounded" style={{ backgroundColor: colors.muted }} />
                        <div className="h-4 w-full rounded" style={{ backgroundColor: colors.muted }} />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-6 w-20 rounded-full" style={{ backgroundColor: colors.whiteHover }} />
                        <div className="h-6 w-24 rounded-full" style={{ backgroundColor: colors.whiteHover }} />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-3/4 rounded" style={{ backgroundColor: colors.muted }} />
                        <div className="h-4 w-1/2 rounded" style={{ backgroundColor: colors.muted }} />
                    </div>
                </div>
            ))}
        </div>
    );
}
