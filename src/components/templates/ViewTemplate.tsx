"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
} from "@fortawesome/free-solid-svg-icons";
import { RecurringTemplate } from "@/types/recuringTemplate";
import { Task } from "@/types/task";
import { getTaskAssignments, getTemplateInstances } from "@/lib/api";
import type { TaskAssignment } from "@/types/assignment";
import { formatDate, formatNumber, formatRelativeDate } from "@/helpers/helpers";
import Badge from "@/components/common/label/Badge";
import TaskAssignedUsers from "@/components/common/label/TaskAssignedUsers";
import Modal from "@/components/modal/Modal";
import { colors } from "@/constants/colors";
import InlineLoadingState from "@/components/common/loading/InlineLoadingState";

interface ViewTemplateProps {
    template: RecurringTemplate;
    onClose: () => void;
}

export default function ViewTemplate({ template, onClose }: ViewTemplateProps) {
    const [instances, setInstances] = useState<Task[]>([]);
    const [instanceAssignments, setInstanceAssignments] = useState<Record<string, TaskAssignment[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadInstances();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [template.id]);

    async function loadInstances() {
        try {
            setLoading(true);
            const data = await getTemplateInstances(template.id);
            setInstances(data);
            const assignmentEntries = await Promise.all(
                data.map(async (instance) => {
                    try {
                        const assignments = await getTaskAssignments(instance.task_id);
                        return [instance.task_id, assignments] as const;
                    } catch {
                        return [instance.task_id, []] as const;
                    }
                })
            );
            setInstanceAssignments(Object.fromEntries(assignmentEntries));
        } catch (err) {
            setError("Kunne ikke indlæse opgave instanser");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // --- Modal footer ---
    const modalFooter = (
        <div className="flex items-center">
            <div className="body-xs" style={{ color: colors.textMuted }}>
                Oprettet: {formatDate(template.created_at)}
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Instanser"
            footer={modalFooter}
            maxWidth="3xl"
        >
            <div>
                {loading ? (
                    <InlineLoadingState label="Indlæser instanser..." centered className="py-12" />
                ) : error ? (
                    <div
                        className="rounded-md border px-4 py-3"
                        style={{
                            borderColor: colors.red,
                            backgroundColor: colors.redLight,
                        }}
                    >
                        <p className="body-sm" style={{ color: colors.red }}>{error}</p>
                    </div>
                ) : instances.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="body-sm" style={{ color: colors.textMuted }}>Ingen instanser fundet</p>
                    </div>
                ) : (
                    <div
                        className="overflow-hidden rounded-md border"
                        style={{ borderColor: colors.border }}
                    >
                        {instances.map((instance, index) => (
                            (() => {
                                const assignments = instanceAssignments[instance.task_id] ?? [];
                                const targetQuantity = instance.target_quantity;
                                const currentQuantity = instance.current_quantity ?? 0;
                                const goalProgress = instance.goal_type === "FIXED" && typeof targetQuantity === "number" && targetQuantity > 0
                                    ? {
                                        targetQuantity,
                                        percent: Math.max(0, Math.min(100, Math.round((currentQuantity / targetQuantity) * 100))),
                                    }
                                    : null;

                                return (
                                    <div
                                        key={instance.task_id}
                                        className="flex items-start justify-between gap-4 px-4 py-2.5"
                                        style={{
                                            borderTop: index === 0 ? "none" : `1px solid ${colors.border}`,
                                        }}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="h4" style={{ color: colors.textPrimary }}>
                                                    {instance.occurrence_date && formatDate(instance.occurrence_date)}
                                                </span>
                                                <Badge variant="status" size="md" value={instance.status} />
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 body-sm" style={{ color: colors.textSecondary }}>
                                                <span className="inline-flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5" />
                                                    <span>Deadline: {formatRelativeDate(instance.deadline)}</span>
                                                </span>
                                                <TaskAssignedUsers assignments={assignments} size="sm" className="min-h-6" />
                                            </div>
                                        </div>
                                        <div className="w-28 shrink-0 text-right">
                                            {goalProgress ? (
                                                <>
                                                    <div className="label-md" style={{ color: colors.textPrimary }}>
                                                        {formatNumber(currentQuantity)}/{formatNumber(goalProgress.targetQuantity)}
                                                    </div>
                                                    <div className="mt-1 body-sm" style={{ color: colors.textSecondary }}>
                                                        {goalProgress.percent}%
                                                    </div>
                                                    <div
                                                        className="mt-1.5 ml-auto h-1.5 w-full overflow-hidden rounded-full"
                                                        style={{ backgroundColor: colors.border }}
                                                    >
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${goalProgress.percent}%`,
                                                                backgroundColor: colors.green,
                                                            }}
                                                        />
                                                    </div>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })()
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}
