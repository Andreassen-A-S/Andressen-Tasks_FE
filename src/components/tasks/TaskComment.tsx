"use client";

import { useEffect, useState, useContext } from "react";
import { getTaskComments, createComment, deleteComment, getUser } from "@/lib/api";
import { Comment } from "@/types/comment";
import { User } from "@/types/users";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "@/contexts/AuthContext";
import { formatCommentDate } from "@/helpers/helpers";

interface TaskCommentsProps {
    taskId: string;
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
    const authContext = useContext(AuthContext);
    const currentUser = authContext?.user;

    const [comments, setComments] = useState<Comment[]>([]);
    const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentError, setCommentError] = useState<string | null>(null);
    const [comment, setComment] = useState("");

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setIsLoadingComments(true);
                setCommentError(null);
                const commentsData = await getTaskComments(taskId);
                setComments(commentsData);

                // Fetch authors for all comments
                const uniqueUserIds = [...new Set(commentsData.map(c => c.user_id))];
                const authorsData: Record<string, User> = {};

                await Promise.all(
                    uniqueUserIds.map(async (userId) => {
                        try {
                            const userData = await getUser(userId);
                            authorsData[userId] = userData;
                        } catch (err) {
                            console.error(`Error fetching user ${userId}:`, err);
                        }
                    })
                );

                setCommentAuthors(authorsData);
            } catch (err) {
                console.error("Error fetching comments:", err);
                setCommentError("Kunne ikke hente kommentarer");
            } finally {
                setIsLoadingComments(false);
            }
        };

        if (taskId) {
            fetchComments();
        }
    }, [taskId]);

    const handleSubmitComment = async () => {
        if (!comment.trim()) return;

        try {
            setIsSubmittingComment(true);
            setCommentError(null);
            const newComment = await createComment(taskId, { message: comment.trim() });

            setComments(prev => [...prev, newComment]);

            if (currentUser && !commentAuthors[newComment.user_id]) {
                try {
                    const userData = await getUser(newComment.user_id);
                    setCommentAuthors(prev => ({ ...prev, [newComment.user_id]: userData }));
                } catch (err) {
                    console.error("Error fetching comment author:", err);
                }
            }

            setComment("");
        } catch (err) {
            console.error("Error creating comment:", err);
            setCommentError("Kunne ikke tilføje kommentar");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Er du sikker på at du vil slette denne kommentar?")) return;

        try {
            await deleteComment(commentId);
            setComments(prev => prev.filter(c => c.comment_id !== commentId));
        } catch (err) {
            console.error("Error deleting comment:", err);
            alert("Kunne ikke slette kommentar");
        }
    };


    return (
        <div>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
                Kommentarer ({comments.length})
            </h2>
            {isLoadingComments ? (
                <div className="flex justify-center py-4">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-gray-400" />
                </div>
            ) : commentError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm mb-4">
                    {commentError}
                </div>
            ) : comments.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-4">Ingen kommentarer endnu</p>
            ) : (
                <div className="space-y-3 mb-4">
                    {comments.map((c) => {
                        const author = commentAuthors[c.user_id];
                        const isOwnComment = currentUser?.user_id === c.user_id;

                        return (
                            <div key={c.comment_id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {author?.name || author?.email || 'Ukendt bruger'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatCommentDate(c.created_at)}
                                        </span>
                                    </div>
                                    {isOwnComment && (
                                        <button
                                            onClick={() => handleDeleteComment(c.comment_id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Slet kommentar"
                                        >
                                            <FontAwesomeIcon icon={faTrash} size="sm" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {c.message}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Comment Input */}
            <div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tilføj en kommentar..."
                    className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 text-sm sm:text-base text-gray-900 placeholder-gray-400 resize-none min-h-20 focus:outline-none focus:border-green-500 transition-all"
                    disabled={isSubmittingComment}
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleSubmitComment}
                        disabled={!comment.trim() || isSubmittingComment}
                        className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmittingComment ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Sender...
                            </>
                        ) : (
                            'Send kommentar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}