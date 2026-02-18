"use client";

import { useEffect, useState } from "react";
import { Task, TaskGoalType, TaskStatus } from "@/types/task";
import { addTaskProgress, getTask, updateTask, getUser } from "@/lib/api";
import { User } from "@/types/users";
import { translatePriority, translateTaskUnit, getPriorityAccentColors } from "@/helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCheck } from "@fortawesome/free-solid-svg-icons";
import UserTaskComment from "./UserTaskComment";
import CloseButton from "@/components/common/buttons/CloseButton";
import Badge from "@/components/common/label/badge";
import RecurringBadge from "@/components/common/label/recurringBadge";

interface UserTaskDetailsProps {
    taskId: string;
    onBack: () => void;
}

export default function UserTaskDetails({ taskId, onBack }: UserTaskDetailsProps) {
    const [task, setTask] = useState<Task | null>(null);
    const [creator, setCreator] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [progressDelta, setProgressDelta] = useState("");
    const [progressNote, setProgressNote] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

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
                console.error("Error fetching task:", err);
                setError("Kunne ikke hente opgave detaljer");
            } finally {
                setIsLoading(false);
            }
        };

        if (taskId) {
            fetchTask();
            // open animation after mount
            setTimeout(() => setIsOpen(true), 10);
        }
    }, [taskId]);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => onBack(), 200);
    };

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

    const handleAddProgress = async () => {
        if (!task) return;
        const delta = Number(progressDelta);

        if (!Number.isFinite(delta) || delta <= 0) {
            alert("Indtast et gyldigt fremskridt over 0");
            return;
        }

        try {
            setIsUpdating(true);
            await addTaskProgress(task.task_id, {
                quantity_done: delta,
                note: progressNote.trim() || undefined,
                unit: task.unit || undefined,
            });
            const updatedTask = await getTask(task.task_id);
            setTask(updatedTask);
            setProgressDelta("");
            setProgressNote("");
        } catch (err) {
            console.error("Error adding progress:", err);
            alert("Kunne ikke registrere fremskridt");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) handleClose();
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B1D22]/50">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-[#0f6e56]" />
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B1D22]/50 p-4">
                <div className="bg-white rounded-[20px] p-6 max-w-md w-full border border-[#E8E6E1] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                    <div className="bg-[#FDECEC] border border-[#D64545] rounded-lg p-4 text-[#D64545] mb-4">
                        {error || "Opgave ikke fundet"}
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-full h-11 rounded-lg bg-[#E8E6E1] hover:bg-[#FAFAF7] transition-colors btn-md text-[#1B1D22] border border-[#E8E6E1]"
                    >
                        Luk
                    </button>
                </div>
            </div>
        );
    }



    const priorityBgClass = () => {
        switch (task.priority) {
            case "HIGH":
                return "bg-red-50 text-red-600";
            case "MEDIUM":
                return "bg-amber-50 text-amber-700";
            case "LOW":
                return "bg-emerald-50 text-emerald-700";
            default:
                return "bg-gray-100 text-gray-500";
        }
    };

    const unitLabel = translateTaskUnit(task.unit);
    const currentQuantity = task.current_quantity ?? 0;
    const hasTarget = task.target_quantity != null;
    const hasProgress = task.current_quantity != null && task.goal_type === TaskGoalType.FIXED;

    const progressPct =
        hasTarget && task.target_quantity
            ? Math.min(100, Math.round((currentQuantity / task.target_quantity) * 100))
            : null;

    const progressLabel = hasTarget
        ? `${currentQuantity} / ${task.target_quantity}${unitLabel ? ` ${unitLabel}` : ""}`
        : `${currentQuantity}${unitLabel ? ` ${unitLabel}` : ""}`;

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-[#1B1D22]/50 z-40 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={handleOverlayClick}
            />

            {/* Bottom Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[20px] max-h-[93vh] flex flex-col border border-[#E8E6E1] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-transform duration-200 ${isOpen ? "translate-y-0" : "translate-y-full"}`}
                style={{ maxWidth: "430px", margin: "0 auto" }}
                role="dialog"
                aria-modal="true"
            >
                {/* Handle */}
                <div className="flex items-center justify-center pt-3 pb-2 shrink-0">
                    <div className="w-9 h-1 rounded-full bg-[#E8E6E1]" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3 shrink-0">
                    <Badge variant="status" value={task.status}
                        size="lg" />
                    <div className="border border-gray-200 rounded-lg">
                        <CloseButton onClick={handleClose} />
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 px-5 pb-10 no-scrollbar">
                    {/* Priority Badge */}
                    <div className="flex items-center gap-2 mb-2.5">
                        <div
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${priorityBgClass()}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${getPriorityAccentColors(task.priority)}`} />
                            <span className="badge">
                                {translatePriority(task.priority)} prioritet
                            </span>
                        </div>
                        <div>
                            {task.recurring_template_id && (
                                <RecurringBadge
                                    size="md"
                                />
                            )}
                        </div>
                    </div>


                    {/* Title */}
                    <h1 className="h3 mb-1.5 text-[#1B1D22]">{task.title}</h1>

                    {/* Description */}
                    {task.description && <p className="body-sm mb-5 text-[#6B7084]">{task.description}</p>}

                    {/* Progress */}
                    {hasProgress && (
                        <>
                            <div className="overline mb-2.5">Fremskridt</div>

                            <div className="flex items-baseline justify-between mb-1.5">
                                <div className="mono-md text-[#1B1D22]">{progressLabel}</div>
                                {progressPct !== null && <div className="mono-md text-[#9DA1B4]">{progressPct}%</div>}
                            </div>

                            <div className="h-2 rounded bg-[#E8E6E1] overflow-hidden mb-4">
                                <div
                                    className="h-full rounded bg-[#0f6e56] transition-all"
                                    style={{ width: progressPct !== null ? `${progressPct}%` : "0%" }}
                                />
                            </div>

                            {/* Inputs */}
                            <input
                                type="number"
                                min={0}
                                step="any"
                                placeholder={`+ Tilføj ${unitLabel || "enheder"}`}
                                value={progressDelta}
                                onChange={(e) => setProgressDelta(e.target.value)}
                                className="w-full h-11 rounded-lg border border-[#E8E6E1] px-3.5 bg-[#F6F5F1] focus:border-[#2D9F6F] focus:outline-none transition-colors mb-2 mono-sm text-[#1B1D22]"
                            />

                            <button
                                onClick={handleAddProgress}
                                disabled={isUpdating}
                                className="w-full h-11 rounded-lg bg-[#0f6e56] text-white hover:bg-[#249e7a] disabled:opacity-50 transition-colors btn-md"
                            >
                                Registrer fremskridt
                            </button>

                            <div className="h-px bg-[#E8E6E1] my-4" />
                        </>
                    )}

                    {/* Comments */}
                    <UserTaskComment taskId={taskId} />

                </div>
                <div className="flex-col-1 px-5 pb-10 shrink-0">

                    {/* Metadata */}
                    <div className="flex items-center justify-between  pt-2 border-t border-[#E8E6E1] mono-xs text-[#9DA1B4]">
                        <span>Oprettet af: {creator?.name || creator?.email || task.created_by}</span>
                        <span>
                            {new Date(task.created_at)
                                .toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })
                                .replace(".", ". ")}
                        </span>
                    </div>

                    {/* Complete Button */}
                    <button
                        onClick={handleCompleteTask}
                        disabled={isUpdating}
                        className="w-full h-13 rounded-xl bg-[#0f6e56] text-white flex items-center justify-center gap-2 hover:bg-[#249e7a] disabled:opacity-50 transition-colors mt-4 btn-lg"
                    >
                        {isUpdating ? (
                            <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faCheck} className="text-lg" />
                                {task.status === "DONE" ? "Marker som ikke færdig" : "Marker som færdig"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
