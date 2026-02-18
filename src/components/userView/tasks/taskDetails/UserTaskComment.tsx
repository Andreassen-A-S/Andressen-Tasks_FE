"use client";

import { useEffect, useState, useContext } from "react";
import { getTaskComments, createComment, deleteComment, getUser } from "@/lib/api";
import { TaskComment } from "@/types/comment";
import { User } from "@/types/users";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "@/contexts/AuthContext";
import TaskCommentBubble from "./UserTaskCommentBubble";
import OwnTaskCommentBubble from "./OwnUserTaskCommentBubble";

interface TaskCommentsProps {
    taskId: string;
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
    const authContext = useContext(AuthContext);
    const currentUser = authContext?.user;

    const [comments, setComments] = useState<TaskComment[]>([]);
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
            const newComment = await createComment(
                taskId,
                { message: comment.trim() }
            );
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
        <section>
            <h2 className="overline mb-4">Kommentarer ({comments.length})</h2>
            {isLoadingComments ? (
                <div className="flex justify-center py-4">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-[#9DA1B4]" />
                </div>
            ) : commentError ? (
                <div className="bg-[#FDECEC] border border-[#D64545] rounded-lg p-3 text-[#D64545] caption mb-4">
                    {commentError}
                </div>
            ) : comments.length === 0 ? (
                <p className="caption italic py-4 text-[#9DA1B4]">Ingen kommentarer endnu</p>
            ) : (
                <div className="space-y-3 mb-4">
                    {comments.map((c) => {
                        const author = commentAuthors[c.user_id];
                        const isOwnComment = currentUser?.user_id === c.user_id;

                        return (
                            isOwnComment ? (
                                <OwnTaskCommentBubble
                                    key={c.comment_id}
                                    comment={c}
                                    onDelete={handleDeleteComment}
                                />

                            ) : (
                                <TaskCommentBubble
                                    key={c.comment_id}
                                    comment={c}
                                    author={author}
                                />
                            )

                        );


                    })}
                </div >
            )}

            {/* Add Comment Input */}
            <div className="mt-6">
                <div className="flex items-start gap-4">
                    {/* Right side (textarea + button) */}
                    <div className="flex-1">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tilføj en kommentar..."
                            disabled={isSubmittingComment}
                            className="w-full bg-white border border-[#E8E6E1] rounded-lg px-5 py-4 body-md placeholder:text-[#9DA1B4] resize-none 
                   focus:outline-none focus:ring-2 focus:ring-[#2D9F6F]/30 focus:border-[#2D9F6F]
                   disabled:bg-[#FAFAF7] disabled:text-[#9DA1B4]"
                        />

                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSubmitComment}
                                disabled={!comment.trim() || isSubmittingComment}
                                className="inline-flex items-center gap-2 rounded-lg bg-[#0f6e56] px-5 py-2.5 btn-md text-white
                     hover:bg-[#249e7a] transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmittingComment ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        Sender...
                                    </>
                                ) : (
                                    "Kommenter"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
}