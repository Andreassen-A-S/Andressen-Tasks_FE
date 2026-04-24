"use client";

import { useState } from "react";
import { toast } from "sonner";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createProject, updateProject, deleteProject } from "@/lib/api";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/types/project";
import ConfirmModal from "@/components/common/ConfirmModal";
import Button from "@/components/common/buttons/Button";
import ProjectTable, { type ProjectSortKey } from "./ProjectTable";
import ProjectCreateModal from "./ProjectCreateModal";
import ProjectEditModal from "./ProjectEditModal";
import PageHeader from "@/components/common/PageHeader";
import TableSkeleton from "@/components/common/loading/TableSkeleton";
import { adminQueryKeys, fetchProjectsPageData, type ProjectsPageData } from "@/lib/queries/admin";

export default function ProjectPage() {
    const createProjectFormId = "create-project-form";
    const editProjectFormId = "edit-project-form";
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [sortBy, setSortBy] = useState<ProjectSortKey>("name");
    const { data, isPending } = useQuery({
        queryKey: adminQueryKeys.projectsPage,
        queryFn: fetchProjectsPageData,
    });

    const projects = data?.projects ?? [];
    const taskCounts = data?.taskCounts ?? {};
    const tasksByProject = data?.tasksByProject ?? {};
    const templateCounts = data?.templateCounts ?? {};

    const sortedProjects = [...projects].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "tasks") return (taskCounts[b.project_id] ?? 0) - (taskCounts[a.project_id] ?? 0);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    async function handleCreate(input: CreateProjectInput) {
        const created = await createProject(input);
        queryClient.setQueryData<ProjectsPageData>(adminQueryKeys.projectsPage, (current) => {
            if (!current) return current;
            return {
                ...current,
                projects: [...current.projects, created],
                taskCounts: { ...current.taskCounts, [created.project_id]: 0 },
                tasksByProject: { ...current.tasksByProject, [created.project_id]: [] },
                templateCounts: { ...current.templateCounts, [created.project_id]: 0 },
            };
        });
        toast.success("Projekt oprettet");
        setShowCreateModal(false);
    }

    async function handleUpdate(id: string, input: UpdateProjectInput) {
        const updated = await updateProject(id, input);
        queryClient.setQueryData<ProjectsPageData>(adminQueryKeys.projectsPage, (current) => {
            if (!current) return current;
            return {
                ...current,
                projects: current.projects.map((project) => (project.project_id === id ? updated : project)),
            };
        });
        toast.success("Projekt opdateret");
        setEditingProject(null);
    }

    function handleDelete(id: string) {
        setPendingDeleteId(id);
        setConfirmOpen(true);
    }

    async function handleConfirmDelete() {
        if (!pendingDeleteId) return;
        setDeleteLoading(true);
        try {
            await deleteProject(pendingDeleteId);
            queryClient.setQueryData<ProjectsPageData>(adminQueryKeys.projectsPage, (current) => {
                if (!current) return current;

                const nextTaskCounts = { ...current.taskCounts };
                const nextTasksByProject = { ...current.tasksByProject };
                const nextTemplateCounts = { ...current.templateCounts };

                delete nextTaskCounts[pendingDeleteId];
                delete nextTasksByProject[pendingDeleteId];
                delete nextTemplateCounts[pendingDeleteId];

                return {
                    ...current,
                    projects: current.projects.filter((project) => project.project_id !== pendingDeleteId),
                    taskCounts: nextTaskCounts,
                    tasksByProject: nextTasksByProject,
                    templateCounts: nextTemplateCounts,
                };
            });
            toast.success("Projekt slettet");
            setConfirmOpen(false);
            setPendingDeleteId(null);
        } catch {
            toast.error("Kunne ikke slette projekt");
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Projekter"
                subtitle="Administrer dine projekter"
                action={
                    <Button
                        variant="primary"
                        size="lg"
                        icon={faPlus}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Nyt projekt
                    </Button>
                }
            />

            <div className="mx-8 mt-3 px-4 sm:px-6 lg:px-8 pb-12">
                {isPending ? (
                    <TableSkeleton columns={2} rows={6} showToolbar />
                ) : (
                    <ProjectTable
                        projects={sortedProjects}
                        taskCounts={taskCounts}
                        templateCounts={templateCounts}
                        tasksByProject={tasksByProject}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        onCreateClick={() => setShowCreateModal(true)}
                        onEditProject={setEditingProject}
                        onDeleteProject={handleDelete}
                    />
                )}
            </div>

            <ProjectCreateModal
                isOpen={showCreateModal}
                loading={createLoading}
                formId={createProjectFormId}
                onClose={() => setShowCreateModal(false)}
                onLoadingChange={setCreateLoading}
                onSubmit={handleCreate}
            />

            <ProjectEditModal
                project={editingProject}
                loading={editLoading}
                formId={editProjectFormId}
                onClose={() => setEditingProject(null)}
                onLoadingChange={setEditLoading}
                onSubmit={handleUpdate}
            />

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
                onConfirm={handleConfirmDelete}
                title="Slet projekt"
                description="Er du sikker på, at du vil slette dette projekt?"
                confirmLabel="Slet"
                cancelLabel="Annuller"
                danger
                loading={deleteLoading}
            />
        </div >
    );
}
