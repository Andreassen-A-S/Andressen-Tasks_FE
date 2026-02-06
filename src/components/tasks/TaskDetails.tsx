"use client";

import { useEffect, useState, useContext } from "react";
import { getTask, getUser, getTaskComments, createComment, deleteComment } from "@/lib/api";
import { AuthContext } from "@/contexts/AuthContext";
import type { Task } from "@/types/task";
import type { User } from "@/types/users";
import type { Comment } from "@/types/comment";
import { formatRelativeDate } from "@/helpers/helpers";
import TaskComments from "@/components/tasks/TaskComment";

interface TaskDetailsProps {
    taskId: string;
    onClose: () => void;
}

export default function TaskDetails({ taskId, onClose }: TaskDetailsProps) {
    const authContext = useContext(AuthContext);
    const currentUser = authContext?.user;

    const [task, setTask] = useState<Task | null>(null);
    const [creator, setCreator] = useState<User | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});
    const [isLoading, setIsLoading] = useState(true);
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

                if (taskData.created_by) {
                    try {
                        const creatorData = await getUser(taskData.created_by);
                        setCreator(creatorData);
                    } catch (err) {
                        console.error("Error fetching creator:", err);
                    }
                }
            } catch (err) {
                setError("Kunne ikke hente opgave detaljer");
            } finally {
                setIsLoading(false);
            }
        };

        if (taskId) fetchTask();
    }, [taskId]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setIsLoadingComments(true);
                setCommentError(null);
                const commentsData = await getTaskComments(taskId);
                setComments(commentsData);

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
                setCommentError("Kunne ikke hente kommentarer");
            } finally {
                setIsLoadingComments(false);
            }
        };

        if (taskId) fetchComments();
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
            alert("Kunne ikke slette kommentar");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-sm">Indlæser...</div>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-6 bg-red-50 border-b border-red-200">
                    <div className="text-red-800 font-medium">
                        {error || "Opgave ikke fundet"}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-[#fafbfc] flex justify-between items-start">
                <div className="flex-1 pr-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight tracking-tight">
                        {task.title}
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        #{task.task_id.slice(0, 8)} • Oprettet af {creator?.name || creator?.email || 'Ukendt'} • {formatRelativeDate(task.created_at)}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded px-2 py-1 transition-all text-2xl leading-none -mt-1"
                    aria-label="Luk"
                >
                    ×
                </button>
            </div>

            {/* Panel Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
                {/* Description Section */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-4 pb-2 border-b-2 border-gray-200">
                        Beskrivelse
                    </h3>
                    <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                        {task.description || <span className="italic text-gray-400">Ingen beskrivelse</span>}
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mb-6 pb-6 border-b border-gray-100">
                    <TaskComments taskId={taskId} />
                </div>
            </div>
        </div>
    );
}