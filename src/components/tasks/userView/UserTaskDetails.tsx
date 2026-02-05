"use client";

import { useEffect, useState, useContext } from "react";
import { Task, TaskStatus } from "@/types/task";
import { getTask, updateTask, getUser, getTaskComments, createComment, deleteComment } from "@/lib/api";
import { User } from "@/types/users";
import { Comment } from "@/types/comment";
import { formatRelativeDate, translatePriority } from "@/helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "@/contexts/AuthContext";

interface UserTaskDetailsProps {
    taskId: string;
    onBack: () => void;
}

export default function UserTaskDetails({ taskId, onBack }: UserTaskDetailsProps) {
    const authContext = useContext(AuthContext);
    const currentUser = authContext?.user;

    const [task, setTask] = useState<Task | null>(null);
    const [creator, setCreator] = useState<User | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [commentError, setCommentError] = useState<string | null>(null);
    const [comment, setComment] = useState("");

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setIsLoading(true);
                const taskData = await getTask(taskId);
                setTask(taskData);

                // Fetch creator info
                if (taskData.created_by) {
                    try {
                        const creatorData = await getUser(taskData.created_by);
                        setCreator(creatorData);
                    } catch (err) {
                        console.error("Error fetching creator:", err);
                    }
                }
            } catch (err) {
                console.error("Error fetching task:", err);
                setError("Kunne ikke hente opgave detaljer");
            } finally {
                setIsLoading(false);
            }
        };

        if (taskId) {
            fetchTask();
        }
    }, [taskId]);

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

    const handleCompleteTask = async () => {
        if (!task) return;

        try {
            setIsUpdating(true);
            const newStatus = task.status === TaskStatus.DONE ? TaskStatus.PENDING : TaskStatus.DONE;
            const updatedTask = await updateTask(task.task_id, { status: newStatus });
            setTask(updatedTask);
        } catch (err) {
            console.error("Error updating task:", err);
            alert("Kunne ikke opdatere opgave");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!comment.trim()) return;

        try {
            setIsSubmittingComment(true);
            setCommentError(null);
            const newComment = await createComment(taskId, { message: comment.trim() });

            // Add new comment to the list
            setComments(prev => [...prev, newComment]);

            // Fetch author data for the new comment if not already cached
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

    const formatCommentDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Lige nu";
        if (diffMins < 60) return `${diffMins} min siden`;
        if (diffHours < 24) return `${diffHours} timer siden`;
        if (diffDays < 7) return `${diffDays} dage siden`;

        return date.toLocaleDateString('da-DK', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-green-500" />
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                        {error || "Opgave ikke fundet"}
                    </div>
                    <button
                        onClick={onBack}
                        className="mt-4 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Tilbage
                    </button>
                </div>
            </div>
        );
    }

    const getLeftBorderColor = () => {
        switch (task.priority) {
            case 'HIGH':
                return '#ef4444';
            case 'MEDIUM':
                return '#fb923c';
            case 'LOW':
                return '#facc15';
            default:
                return '#d1d5db';
        }
    };

    const getPriorityTextClass = () => {
        switch (task.priority) {
            case 'HIGH':
                return 'text-red-600';
            case 'MEDIUM':
                return 'text-orange-600';
            case 'LOW':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 flex flex-col flex-1">
                {/* Header with close button */}
                <div className="flex items-center mb-4 sm:mb-6">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:scale-105 transition-all flex-shrink-0"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-gray-600" />
                    </button>
                </div>

                {/* Main Card */}
                <div
                    className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col flex-1"
                    style={{
                        borderLeft: `4px solid ${getLeftBorderColor()}`
                    }}
                >
                    {/* Priority and Time Header */}
                    <div className="flex items-center justify-between mb-4 sm:mb-5 pb-4 border-b border-gray-200">
                        <div className={`text-xs font-semibold uppercase tracking-wide ${getPriorityTextClass()}`}>
                            {translatePriority(task.priority)} prioritet
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
                            {formatRelativeDate(task.deadline)}
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
                        {task.title}
                    </h1>

                    {/* Description */}
                    {task.description && (
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                            {task.description}
                        </p>
                    )}

                    {/* Comments Section */}
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
                            Kommentarer ({comments.length})
                        </h2>

                        {/* Comments List */}
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
                                className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 text-sm sm:text-base text-gray-900 placeholder-gray-400 resize-none min-h-[80px] focus:outline-none focus:border-green-500 transition-all"
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

                    {/* Metadata Section */}
                    <div className="text-xs text-gray-500 space-y-1 mb-6 pb-6 border-b border-gray-100">
                        <div>
                            <span className="font-medium">Oprettet af:</span> {creator?.name || creator?.email || task.created_by}
                        </div>
                        <div>
                            <span className="font-medium">Oprettet:</span>{" "}
                            {new Date(task.created_at).toLocaleDateString('da-DK', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleCompleteTask}
                        disabled={isUpdating}
                        className={`w-full py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all mt-auto ${task.status === 'DONE'
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUpdating ? (
                            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                        ) : null}
                        {task.status === 'DONE' ? 'Marker som ikke færdig' : 'Færdig'}
                    </button>
                </div>
            </div>
        </div>
    );
}