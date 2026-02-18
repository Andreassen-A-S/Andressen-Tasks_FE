import SingleAvatar from "../../../common/label/singleAvatar";
import { formatCommentDate } from "@/helpers/helpers";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";

interface TaskCommentBubbleProps {
    comment: TaskComment;
    author?: User;
}

export default function TaskCommentBubble({
    comment,
    author,
}: TaskCommentBubbleProps) {
    return (
        <div
            className={`gap-2 flex flex-col`}
        >
            {/* Avatar */}
            <div className="flex items-center gap-2">
                <SingleAvatar
                    name={author?.name || "Ukendt bruger"}
                    size="xs"
                />
                <span className="label-lg">{author?.name || author?.email || 'Ukendt bruger'}</span>

                <span className="mono-xs text-[#9DA1B4]">{formatCommentDate(comment.created_at)}</span>
            </div>


            {/* Comment bubble */}
            <div className="flex min-w-0 max-w-[75%]">
                <div
                    className={`min-w-0 rounded-lg px-3 py-2 bg-[#F6F5F1] text-[#1B1D22]`}

                >
                    <p className="body-sm leading-relaxed wrap-break-words">
                        {comment.message}
                    </p>
                </div>
            </div>
        </div>
    );
}