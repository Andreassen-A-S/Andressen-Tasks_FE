"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteTask, getAllAssignments } from "@/lib/api";
import type { Task } from "@/types/task";
import { TaskPriority } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";
import Modal from "../../modal/Modal";
import UpdateTaskForm from "../updateTaskView/UpdateTaskForm";
import Drawer from "../../drawer/drawer";
import TaskDetails from "../taskDetailsView/TaskDetails";
import ParentTaskRow from "./ParentTaskRow";
import RecurringTaskRow from "./RecuringTaskRow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown } from "@fortawesome/free-solid-svg-icons";
import { faSortUp } from "@fortawesome/free-solid-svg-icons";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "@/components/common/ConfirmModal";


type SortKey = "title" | "priority" | "status" | "scheduled_date" | "deadline";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<TaskPriority, number> = {
    [TaskPriority.LOW]: 1,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.HIGH]: 3,
};

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey | null; sortDir: SortDir }) {
    if (sortKey !== column) return <span className="ml-1 opacity-30"><FontAwesomeIcon icon={faSort} className="w-3.5 h-3.5" /></span>;
    return <span className="ml-1">{sortDir === "asc" ? <FontAwesomeIcon icon={faSortUp} className="w-3.5 h-3.5" /> : <FontAwesomeIcon icon={faSortDown} className="w-3.5 h-3.5" />}</span>;
}

interface TaskListProps {
    tasks: Task[];
    onTaskUpdate: () => void;
    onTaskDelete: (taskId: string) => void;
}

export default function TaskList({
    tasks = [],
    onTaskUpdate,
    onTaskDelete,
}: TaskListProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [taskAssignments, setTaskAssignments] = useState<
        Record<string, TaskAssignment[]>
    >({});
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Group tasks into parents and subtasks, then sort parents
    const { parents, subtasksMap } = useMemo(() => {
        const parentList: Task[] = [];
        const subtasksMap: Record<string, Task[]> = {};

        tasks.forEach(task => {
            if (task.parent_task_id) {
                if (!subtasksMap[task.parent_task_id]) {
                    subtasksMap[task.parent_task_id] = [];
                }
                subtasksMap[task.parent_task_id].push(task);
            } else {
                parentList.push(task);
            }
        });

        if (sortKey) {
            parentList.sort((a, b) => {
                let cmp = 0;
                if (sortKey === "priority") {
                    cmp = (PRIORITY_ORDER[a.priority] ?? 0) - (PRIORITY_ORDER[b.priority] ?? 0);
                } else {
                    const aVal = (a[sortKey] ?? "") as string;
                    const bVal = (b[sortKey] ?? "") as string;
                    cmp = aVal.localeCompare(bVal);
                }
                return sortDir === "asc" ? cmp : -cmp;
            });
        }

        return { parents: parentList, subtasksMap };
    }, [tasks, sortKey, sortDir]);

    useEffect(() => {
        let active = true;

        async function loadAllAssignments() {
            try {
                const assignments = await getAllAssignments();
                if (!active) return;
                const map: Record<string, TaskAssignment[]> = {};
                for (const task of tasks) {
                    map[task.task_id] = [];
                }
                for (const assignment of assignments) {
                    if (map[assignment.task_id]) {
                        map[assignment.task_id].push(assignment);
                    }
                }
                setTaskAssignments(map);
            } catch (err) {
                console.error("Failed to load assignments:", err);
                if (!active) return;
                const emptyMap: Record<string, TaskAssignment[]> = {};
                for (const task of tasks) {
                    emptyMap[task.task_id] = [];
                }
                setTaskAssignments(emptyMap);
            }
        }

        if (tasks.length > 0) {
            loadAllAssignments();
        }

        return () => {
            active = false;
        };
    }, [tasks]);

    function handleSort(key: SortKey) {
        if (sortKey === key) {
            if (sortDir === "asc") {
                setSortDir("desc");
            } else {
                setSortKey(null);
                setSortDir("asc");
            }
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    }

    function handleEditClick(task: Task) {
        setSelectedTask(task);
        setShowEditModal(true);
    }

    function handleEditSuccess() {
        setShowEditModal(false);
        setSelectedTask(null);
        onTaskUpdate();
    }

    function handleEditCancel() {
        setShowEditModal(false);
        setSelectedTask(null);
    }

    function handleDelete(taskId: string) {
        setPendingDeleteId(taskId);
        setConfirmOpen(true);
    }

    async function handleConfirmDelete() {
        if (!pendingDeleteId) return;
        setDeleteLoading(true);
        try {
            await deleteTask(pendingDeleteId);
            onTaskDelete(pendingDeleteId);
            setConfirmOpen(false);
            setPendingDeleteId(null);
        } catch (error) {
            console.error("Failed to delete task:", error);
            toast.error("Kunne ikke slette opgaven. Prøv igen senere.");
        } finally {
            setDeleteLoading(false);
        }
    }

    function handleTaskClick(taskId: string) {
        setSelectedTaskId(taskId);
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

    const sortableHeaderClass = "px-6 py-3 table-header cursor-pointer select-none hover:text-[#1a1a2e] transition-colors";

    return (
        <>
            <div className="rounded-lg border border-[#E8E6E1] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-[#E8E6E1]">
                            <tr>
                                <th></th>
                                <th
                                    className={`py-3 table-header cursor-pointer select-none hover:text-[#1a1a2e] transition-colors`}
                                    onClick={() => handleSort("title")}
                                >
                                    OPGAVE<SortIcon column="title" sortKey={sortKey} sortDir={sortDir} />
                                </th>
                                <th
                                    className={sortableHeaderClass}
                                    onClick={() => handleSort("priority")}
                                >
                                    PRIORITET<SortIcon column="priority" sortKey={sortKey} sortDir={sortDir} />
                                </th>
                                <th
                                    className={sortableHeaderClass}
                                    onClick={() => handleSort("status")}
                                >
                                    STATUS<SortIcon column="status" sortKey={sortKey} sortDir={sortDir} />
                                </th>
                                <th className="px-6 py-3 table-header">TILDELT TIL</th>
                                <th
                                    className={sortableHeaderClass}
                                    onClick={() => handleSort("scheduled_date")}
                                >
                                    START DATO<SortIcon column="scheduled_date" sortKey={sortKey} sortDir={sortDir} />
                                </th>
                                <th
                                    className={sortableHeaderClass}
                                    onClick={() => handleSort("deadline")}
                                >
                                    DEADLINE<SortIcon column="deadline" sortKey={sortKey} sortDir={sortDir} />
                                </th>
                                <th className="px-6 py-3 table-header">HANDLINGER</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parents.map((task) => {
                                const TaskRowComponent = task.recurring_template_id
                                    ? RecurringTaskRow
                                    : ParentTaskRow;

                                return (
                                    <TaskRowComponent
                                        key={task.task_id}
                                        task={task}
                                        subtasks={subtasksMap[task.task_id] || []}
                                        taskAssignments={taskAssignments}
                                        onTaskClick={handleTaskClick}
                                        onEditClick={handleEditClick}
                                        onDeleteClick={handleDelete}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Task Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={handleEditCancel}
                title="Rediger Opgave"
                maxWidth="3xl"
            >
                {selectedTask && (
                    <UpdateTaskForm
                        task={selectedTask}
                        onSuccess={handleEditSuccess}
                        onCancel={handleEditCancel}
                    />
                )}
            </Modal>

            {/* Task Details Drawer */}
            <Drawer open={!!selectedTaskId} onClose={handleCloseDrawer}>
                {selectedTaskId && (
                    <TaskDetails taskId={selectedTaskId} onClose={handleCloseDrawer} />
                )}
            </Drawer>

            {/* Delete Task Confirm Modal */}
            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
                onConfirm={handleConfirmDelete}
                title="Slet opgave"
                description="Er du sikker på, at du vil slette denne opgave?"
                confirmLabel="Slet"
                cancelLabel="Annuller"
                danger
                loading={deleteLoading}
            />
        </>
    );
}
