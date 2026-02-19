import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { formatCommentDate } from "@/helpers/helpers";
import { TaskComment } from "@/types/comment";

interface OwnTaskCommentBubbleProps {
    comment: TaskComment;
    onDelete: (commentId: string) => void;
}

export default function OwnTaskCommentBubble({
    comment,
    onDelete,
}: OwnTaskCommentBubbleProps) {
    return (
        <div className="flex justify-end gap-2">
            {/* Comment bubble */}
            <div className="min-w-0 max-w-[75%]">
                <div className="flex justify-end items-baseline gap-2 mb-1">
                    <span className="mono-xs text-[#9DA1B4]">{formatCommentDate(comment.created_at)}</span>
                </div>
                <div className="min-w-0 rounded-lg px-3 py-2 bg-[#0f6e56] text-white text-right">
                    <p className="body-sm-white leading-relaxed wrap-break-words">
                        {comment.message}
                    </p>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={() => onDelete(comment.comment_id)}
                        className="text-[#9DA1B4] hover:text-[#D64545] transition-colors mt-1 text-xs"
                        title="Slet kommentar"
                    >
                        <FontAwesomeIcon icon={faTrash} size="sm" /> Slet
                    </button>
                </div>
            </div>
        </div>
    );
}