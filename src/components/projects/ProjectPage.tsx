"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getProjects, createProject, updateProject, deleteProject, getTasks, getRecurringTemplates } from "@/lib/api";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/types/project";
import type { Task } from "@/types/task";
import ConfirmModal from "@/components/common/ConfirmModal";
import Button from "@/components/common/buttons/Button";
import { colors } from "@/constants/colors";
import ProjectTable, { type ProjectSortKey } from "./ProjectTable";
import ProjectCreateModal from "./ProjectCreateModal";
import ProjectEditModal from "./ProjectEditModal";
import PageHeader from "@/components/common/PageHeader";

export default function ProjectPage() {
    const createProjectFormId = "create-project-form";
    const editProjectFormId = "edit-project-form";
    const [projects, setProjects] = useState<Project[]>([]);
    const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
    const [tasksByProject, setTasksByProject] = useState<Record<string, Task[]>>({});
    const [templateCounts, setTemplateCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [sortBy, setSortBy] = useState<ProjectSortKey>("name");

    const sortedProjects = [...projects].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "tasks") return (taskCounts[b.project_id] ?? 0) - (taskCounts[a.project_id] ?? 0);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    useEffect(() => {
        load();
    }, []);

    async function load() {
        try {
            setLoading(true);
            const [projectsResult, tasksResult, templatesResult] = await Promise.allSettled([getProjects(), getTasks(), getRecurringTemplates()]);
            if (projectsResult.status === "fulfilled") setProjects(projectsResult.value);
            if (tasksResult.status === "fulfilled") {
                const counts: Record<string, number> = {};
                const byProject: Record<string, Task[]> = {};
                for (const task of tasksResult.value) {
                    counts[task.project_id] = (counts[task.project_id] ?? 0) + 1;
                    if (!byProject[task.project_id]) byProject[task.project_id] = [];
                    byProject[task.project_id].push(task);
                }
                setTaskCounts(counts);
                setTasksByProject(byProject);
            }
            if (templatesResult.status === "fulfilled") {
                const counts: Record<string, number> = {};
                for (const tpl of templatesResult.value) {
                    counts[tpl.project_id] = (counts[tpl.project_id] ?? 0) + 1;
                }
                setTemplateCounts(counts);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(input: CreateProjectInput) {
        const created = await createProject(input);
        setProjects((prev) => [...prev, created]);
        toast.success("Projekt oprettet");
        setShowCreateModal(false);
    }

    async function handleUpdate(id: string, input: UpdateProjectInput) {
        const updated = await updateProject(id, input);
        setProjects((prev) => prev.map((p) => (p.project_id === id ? updated : p)));
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
            setProjects((prev) => prev.filter((p) => p.project_id !== pendingDeleteId));
            toast.success("Projekt slettet");
            setConfirmOpen(false);
            setPendingDeleteId(null);
        } catch {
            toast.error("Kunne ikke slette projekt");
        } finally {
            setDeleteLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" style={{ color: colors.greenMid }} />
                    <div className="body-sm" style={{ color: colors.textSecondary }}>Indlæser projekter...</div>
                </div>
            </div>
        );
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
