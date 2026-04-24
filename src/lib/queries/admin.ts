import { getAllAssignments, getDashboardStats, getProjects, getRecurringTemplates, getTasks, getUsers } from "@/lib/api";
import type { Task } from "@/types/task";
import type { Project } from "@/types/project";
import type { TaskAssignment } from "@/types/assignment";
import type { User } from "@/types/users";
import type { RecurringTemplate } from "@/types/recuringTemplate";
import type { QueryClient } from "@tanstack/react-query";

export const adminQueryKeys = {
    tasksPage: ["admin", "tasks-page"] as const,
    projectsPage: ["admin", "projects-page"] as const,
    employeesPage: ["admin", "employees-page"] as const,
    templatesPage: ["admin", "templates-page"] as const,
    statsPage: ["admin", "stats-page"] as const,
};

export interface TasksPageData {
    tasks: Task[];
    projects: Project[];
    users: User[];
    taskAssignments: Record<string, TaskAssignment[]>;
}

export interface ProjectsPageData {
    projects: Project[];
    taskCounts: Record<string, number>;
    tasksByProject: Record<string, Task[]>;
    templateCounts: Record<string, number>;
}

export interface EmployeesPageData {
    employees: User[];
}

export interface TemplatesPageData {
    templates: RecurringTemplate[];
}

export async function fetchTasksPageData(): Promise<TasksPageData> {
    const [tasks, projects, users, assignments] = await Promise.all([
        getTasks(),
        getProjects(),
        getUsers(),
        getAllAssignments(),
    ]);

    const taskAssignments: Record<string, TaskAssignment[]> = {};

    for (const task of tasks) {
        taskAssignments[task.task_id] = [];
    }

    for (const assignment of assignments) {
        if (taskAssignments[assignment.task_id]) {
            taskAssignments[assignment.task_id].push(assignment);
        }
    }

    return { tasks, projects, users, taskAssignments };
}

export async function fetchProjectsPageData(): Promise<ProjectsPageData> {
    const [projects, tasks, templates] = await Promise.all([
        getProjects(),
        getTasks(),
        getRecurringTemplates(),
    ]);

    const taskCounts: Record<string, number> = {};
    const tasksByProject: Record<string, Task[]> = {};
    const templateCounts: Record<string, number> = {};

    for (const task of tasks) {
        taskCounts[task.project_id] = (taskCounts[task.project_id] ?? 0) + 1;
        if (!tasksByProject[task.project_id]) {
            tasksByProject[task.project_id] = [];
        }
        tasksByProject[task.project_id].push(task);
    }

    for (const template of templates) {
        templateCounts[template.project_id] = (templateCounts[template.project_id] ?? 0) + 1;
    }

    return { projects, taskCounts, tasksByProject, templateCounts };
}

export async function fetchEmployeesPageData(): Promise<EmployeesPageData> {
    const employees = await getUsers();
    return { employees };
}

export async function fetchTemplatesPageData(): Promise<TemplatesPageData> {
    const templates = await getRecurringTemplates();
    return { templates };
}

export async function prefetchAdminRoute(queryClient: QueryClient, href: string) {
    switch (href) {
        case "/tasks":
            await queryClient.ensureQueryData({
                queryKey: adminQueryKeys.tasksPage,
                queryFn: fetchTasksPageData,
            });
            return;
        case "/projects":
            await queryClient.ensureQueryData({
                queryKey: adminQueryKeys.projectsPage,
                queryFn: fetchProjectsPageData,
            });
            return;
        case "/employees":
            await queryClient.ensureQueryData({
                queryKey: adminQueryKeys.employeesPage,
                queryFn: fetchEmployeesPageData,
            });
            return;
        case "/templates":
            await queryClient.ensureQueryData({
                queryKey: adminQueryKeys.templatesPage,
                queryFn: fetchTemplatesPageData,
            });
            return;
        case "/statistics":
            await queryClient.ensureQueryData({
                queryKey: adminQueryKeys.statsPage,
                queryFn: getDashboardStats,
            });
            return;
        default:
            return;
    }
}

export function updateProjectsPageData(
    data: ProjectsPageData | undefined,
    updater: (current: ProjectsPageData) => ProjectsPageData,
) {
    if (!data) return data;
    return updater(data);
}

export function updateTemplatesPageData(
    data: TemplatesPageData | undefined,
    updater: (current: TemplatesPageData) => TemplatesPageData,
) {
    if (!data) return data;
    return updater(data);
}
