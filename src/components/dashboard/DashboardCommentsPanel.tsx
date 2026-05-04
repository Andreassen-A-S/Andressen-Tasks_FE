"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Task } from "@/types/task";
import { TaskComment } from "@/types/comment";
import { colors } from "@/constants/colors";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import { formatCommentDate, formatNumber } from "@/helpers/helpers";
import LinkedText from "@/components/common/LinkedText";

interface CommentWithTask extends TaskComment {
    task: Task;
}

interface DashboardCommentsPanelProps {
    comments: CommentWithTask[];
}

export type { CommentWithTask };

const INTERVAL_MS = 4000;

export default function DashboardCommentsPanel({ comments }: DashboardCommentsPanelProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [visibleCount, setVisibleCount] = useState(1);

    useEffect(() => {
        const track = trackRef.current;
        const firstCard = cardRefs.current[0];
        if (!track || !firstCard) return;

        const updateVisibleCount = () => {
            const cardWidth = firstCard.getBoundingClientRect().width;
            const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
            const trackWidth = track.getBoundingClientRect().width;
            const cardStep = cardWidth + gap;

            setVisibleCount(Math.max(1, Math.floor((trackWidth + gap) / cardStep)));
        };

        const frame = requestAnimationFrame(updateVisibleCount);
        const observer = new ResizeObserver(updateVisibleCount);
        observer.observe(track);
        observer.observe(firstCard);

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [comments.length]);

    const pageCount = Math.max(1, comments.length - visibleCount + 1);
    const activeIndex = Math.min(index, pageCount - 1);

    const advance = useCallback(() => {
        if (comments.length === 0) return;
        if (pageCount <= 1) return;
        setIndex(current => current >= pageCount - 1 ? 0 : current + 1);
    }, [comments.length, pageCount]);

    useEffect(() => {
        if (paused || pageCount <= 1) return;
        const id = setInterval(advance, INTERVAL_MS);
        return () => clearInterval(id);
    }, [advance, paused, pageCount]);

    useEffect(() => {
        cardRefs.current[activeIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
        });
    }, [activeIndex]);

    return (
        <div
            className="flex-shrink-0 border-t flex flex-col"
            style={{ borderColor: colors.border, backgroundColor: colors.white }}
        >
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2">
                    <span className="label-md" style={{ color: colors.textPrimary }}>Kommentarer i dag</span>
                    <span className="mono-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.muted, color: colors.textSecondary }}>
                        {formatNumber(comments.length)}
                    </span>
                </div>
                {pageCount > 1 && (
                    <div className="flex gap-1">
                        {Array.from({ length: pageCount }, (_, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Vis kommentarer side ${i + 1}`}
                                aria-current={i === activeIndex ? true : undefined}
                                onClick={() => setIndex(i)}
                                className="w-1.5 h-1.5 rounded-full transition-colors"
                                style={{ backgroundColor: i === activeIndex ? colors.textSecondary : colors.border }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {comments.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                    <p className="body-sm" style={{ color: colors.textMuted }}>Ingen kommentarer i dag</p>
                </div>
            ) : (
                <div
                    className="px-3 py-3"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    <div
                        ref={trackRef}
                        className="flex gap-3 overflow-x-hidden scroll-smooth"
                    >
                        {comments.map((comment, commentIndex) => (
                            <div
                                key={comment.comment_id}
                                ref={element => { cardRefs.current[commentIndex] = element; }}
                                className="flex-shrink-0 rounded-md border p-3 flex flex-col gap-2"
                                style={{
                                    flexBasis: "clamp(260px, 24vw, 328px)",
                                    borderColor: colors.border,
                                    backgroundColor: colors.whiteHover,
                                }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <SingleAvatar name={comment.author.name} size="xs" />
                                        <span className="label-sm truncate" style={{ color: colors.textPrimary }}>
                                            {comment.author.name}
                                        </span>
                                    </div>
                                    <span className="mono-xs flex-shrink-0" style={{ color: colors.textMuted }}>
                                        {formatCommentDate(comment.created_at)}
                                    </span>
                                </div>
                                <span className="h5 truncate">{comment.task.title}</span>
                                <LinkedText
                                    as="p"
                                    text={comment.message}
                                    className="body-sm line-clamp-5"
                                    style={{ color: colors.textSecondary }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
