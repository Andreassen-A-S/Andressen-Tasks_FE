"use client";

import type { TaskEvent } from "@/types/taskEvent";
import SingleAvatar from "../../../label/singleAvatar";
import { formatCommentDate } from "@/helpers/helpers";

type Props = {
    event: TaskEvent;
    actorName: string;
    label: string;
};

export default function TaskTimelineComment({ event, actorName, label }: Props) {
    const message =
        event.type === "COMMENT_DELETED"
            ? "(Kommentar slettet)"
            : event.comment?.message ?? event.message ?? "";

    return (
        <div className="flex items-start gap-3">
            <SingleAvatar name={actorName} size="sm" />
            <div className="flex-1 bg-white border border-gray-200 rounded-md">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">{actorName}</span>
                        <span className="text-sm text-gray-500">{formatCommentDate(event.created_at)}</span>
                    </div>
                </div>

                <div className="px-4 py-4">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}
