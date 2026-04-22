"use client";

import type { Task } from "@/types/task";

interface Props {
    tasks: Task[];
    color: string;
}

const WEEKS = 26;
const W = 120;
const H = 28;
const TOP_PAD = 3;
const BOT_PAD = 2;

export default function ProjectActivityBar({ tasks, color }: Props) {
    const now = new Date();
    const buckets = Array<number>(WEEKS).fill(0);

    for (const task of tasks) {
        const date = task.completed_at ?? task.created_at;
        const weeksAgo = Math.floor(
            (now.getTime() - new Date(date).getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        if (weeksAgo >= 0 && weeksAgo < WEEKS) {
            buckets[WEEKS - 1 - weeksAgo]++;
        }
    }

    const max = Math.max(...buckets, 1);

    const points = buckets.map((count, i) => {
        const x = (i / (WEEKS - 1)) * W;
        const y = TOP_PAD + (1 - count / max) * (H - TOP_PAD - BOT_PAD);
        return [x, y] as [number, number];
    });

    const linePath = points
        .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ");

    const fillPath = `${linePath} L${W},${H} L0,${H} Z`;

    return (
        <svg width={W} height={H} className="shrink-0">
            <defs>
                <linearGradient id={`fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <path d={fillPath} fill={`url(#fill-${color.replace("#", "")})`} />
            <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}
