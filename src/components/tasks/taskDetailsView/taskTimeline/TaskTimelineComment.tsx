"use client";

import type { TaskEvent } from "@/types/taskEvent";
import SingleAvatar from "../../../common/label/singleAvatar";
import { formatCommentDate } from "@/helpers/helpers";

type Props = {
    event: TaskEvent;
    actorName: string;
};

export default function TaskTimelineComment({ event, actorName }: Props) {
    const message =
        event.type === "COMMENT_DELETED"
            ? "(Kommentar slettet)"
            : event.comment?.message ?? event.message ?? "";

    return (
        <div className="flex items-start gap-3">
            <SingleAvatar name={actorName} size="sm" />
            <div className="flex-1 bg-white border border-[#E8E6E1] rounded-lg">
                <div className="px-4 py-2 border-b border-[#E8E6E1] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <span className="label-lg">{actorName}</span>
                        <span className="caption">{formatCommentDate(event.created_at)}</span>
                    </div>
                </div>

                <div className="px-4 py-4">
                    <p className="body-sm leading-relaxed whitespace-pre-wrap">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}