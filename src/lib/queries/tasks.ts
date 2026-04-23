import { getProjects, getTask, getTaskAssignments, getUser, getUsers } from "@/lib/api";
import type { Task } from "@/types/task";
import type { TaskAssignment } from "@/types/assignment";
import type { User } from "@/types/users";
import type { Project } from "@/types/project";

export const taskQueryKeys = {
    details: (taskId: string) => ["task", "details", taskId] as const,
};

export interface TaskDetailsData {
    task: Task;
    assignments: TaskAssignment[];
    allUsers: User[];
    projects: Project[];
    creator: User | null;
}

export async function fetchTaskDetailsData(taskId: string): Promise<TaskDetailsData> {
    const [task, assignments, allUsers, projects] = await Promise.all([
        getTask(taskId),
        getTaskAssignments(taskId),
        getUsers(),
        getProjects(),
    ]);

    const creator = task.created_by ? await getUser(task.created_by) : null;

    return {
        task,
        assignments,
        allUsers,
        projects,
        creator,
    };
}
