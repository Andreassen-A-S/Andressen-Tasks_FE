import { Task } from "@/types/task";

export function sortTasks(tasks: Task[]): Task[] {
  const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };

  return [...tasks].sort((a, b) => {
    // First sort by deadline (earliest first)
    const deadlineDiff =
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (deadlineDiff !== 0) return deadlineDiff;

    // Then by priority (HIGH > MEDIUM > LOW)
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
