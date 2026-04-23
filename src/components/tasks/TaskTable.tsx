"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Task } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";
import Drawer from "@/components/common/Drawer";
import TaskDetails from "./taskDetailsView/TaskDetails";
import ParentTaskRow from "./taskRows/ParentTaskRow";
import DataTable from "@/components/common/table/DataTable";
import { fetchTaskDetailsData, taskQueryKeys } from "@/lib/queries/tasks";
import { toast } from "sonner";

interface TaskTableProps {
    tasks: Task[];
    taskAssignments: Record<string, TaskAssignment[]>;
    onTaskDelete: (taskId: string) => void;
}

const staticHeaderClass = "px-6 py-2.5 label-sm";
const columns = [
    { key: "expander", header: null, className: "w-10" },
    { key: "task", header: "Opgave", className: "py-2.5 label-sm" },
    { key: "priority", header: "Prioritet", className: staticHeaderClass },
    { key: "status", header: "Status", className: staticHeaderClass },
    { key: "assignees", header: "Tildelte", className: staticHeaderClass },
    { key: "start", header: "Start", className: staticHeaderClass },
    { key: "deadline", header: "Deadline", className: staticHeaderClass },
];

export default function TaskTable({
    tasks = [],
    taskAssignments,
    onTaskDelete,
}: TaskTableProps) {
    const queryClient = useQueryClient();
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const { parents, subtasksMap } = useMemo(() => {
        const parentList: Task[] = [];
        const nextSubtasksMap: Record<string, Task[]> = {};

        tasks.forEach(task => {
            if (task.parent_task_id) {
                if (!nextSubtasksMap[task.parent_task_id]) {
                    nextSubtasksMap[task.parent_task_id] = [];
                }
                nextSubtasksMap[task.parent_task_id].push(task);
            } else {
                parentList.push(task);
            }
        });

        return { parents: parentList, subtasksMap: nextSubtasksMap };
    }, [tasks]);

    async function handleTaskClick(taskId: string) {
        try {
            await queryClient.ensureQueryData({
                queryKey: taskQueryKeys.details(taskId),
                queryFn: () => fetchTaskDetailsData(taskId),
            });
            setSelectedTaskId(taskId);
        } catch {
            toast.error("Kunne ikke hente opgave detaljer");
        }
    }

    function handleCloseDrawer() {
        setSelectedTaskId(null);
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center body-sm text-[#6B7084] mt-8">
                Ingen opgaver endnu. Opret din første opgave!
            </div>
        );
    }

    return (
        <>
            <DataTable columns={columns}>
                {parents.map((task) => (
                    <ParentTaskRow
                        key={task.task_id}
                        task={task}
                        subtasks={subtasksMap[task.task_id] || []}
                        taskAssignments={taskAssignments}
                        onTaskClick={(taskId) => { void handleTaskClick(taskId); }}
                    />
                ))}
            </DataTable>

            <Drawer open={!!selectedTaskId} onClose={handleCloseDrawer}>
                {selectedTaskId && (
                    <TaskDetails
                        taskId={selectedTaskId}
                        onClose={handleCloseDrawer}
                        onDelete={onTaskDelete}
                    />
                )}
            </Drawer>
        </>
    );
}
