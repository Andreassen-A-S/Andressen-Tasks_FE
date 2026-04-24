import { colors } from "@/constants/colors";

export default function TaskDetailsLoadingState() {
    return (
        <div className="flex flex-col h-full bg-white animate-pulse">
            <div className="px-8 pt-7 pb-5 space-y-4">
                <div className="h-10 w-2/3 rounded" style={{ backgroundColor: colors.muted }} />
                <div className="flex gap-3">
                    <div className="h-8 w-28 rounded-full" style={{ backgroundColor: colors.whiteHover }} />
                    <div className="h-8 w-24 rounded-full" style={{ backgroundColor: colors.whiteHover }} />
                </div>
            </div>
            <div className="mx-8" style={{ borderTop: `1px solid ${colors.border}` }} />
            <div className="flex flex-1 px-8 gap-8 py-6 min-w-0">
                <div className="flex-1 min-w-0 space-y-6">
                    <div className="rounded-lg border overflow-hidden" style={{ borderColor: colors.border }}>
                        <div className="h-9 border-b" style={{ backgroundColor: colors.whiteHover, borderColor: colors.border }} />
                        <div className="p-4 space-y-3">
                            <div className="h-4 w-full rounded" style={{ backgroundColor: colors.muted }} />
                            <div className="h-4 w-5/6 rounded" style={{ backgroundColor: colors.muted }} />
                            <div className="h-4 w-2/3 rounded" style={{ backgroundColor: colors.muted }} />
                        </div>
                    </div>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="rounded-lg border overflow-hidden" style={{ borderColor: colors.border }}>
                            <div className="h-9 border-b" style={{ backgroundColor: colors.whiteHover, borderColor: colors.border }} />
                            <div className="p-4 space-y-2">
                                <div className="h-4 w-full rounded" style={{ backgroundColor: colors.muted }} />
                                <div className="h-4 w-4/5 rounded" style={{ backgroundColor: colors.muted }} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="w-70 shrink-0 space-y-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="space-y-3">
                            <div className="h-4 w-20 rounded" style={{ backgroundColor: colors.muted }} />
                            <div className="h-6 w-36 rounded" style={{ backgroundColor: colors.whiteHover }} />
                            <div style={{ borderTop: `1px solid ${colors.border}` }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
