"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner, faFolder, faArrowDownWideShort, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { getProjects, createProject, updateProject, deleteProject, getTasks, getRecurringTemplates } from "@/lib/api";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/types/project";
import type { Task } from "@/types/task";
import ProjectRow from "./ProjectRow";
import DropdownMenu from "@/components/common/DropdownMenu";
import Modal from "@/components/modal/Modal";
import ConfirmModal from "@/components/common/ConfirmModal";
import Button from "@/components/common/buttons/Button";
import { colors } from "@/constants/colors";
import TextInput from "@/components/common/forms/TextInput";
import TextArea from "@/components/common/forms/TextArea";
import ColorInput from "@/components/common/forms/ColorInput";

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
    type SortKey = "name" | "tasks" | "created";
    const [sortBy, setSortBy] = useState<SortKey>("name");

    const sortLabels: Record<SortKey, string> = { name: "Navn", tasks: "Opgaver", created: "Oprettet" };

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
            {/* Header */}
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="h1">Projekter</h1>
                        <p className="body-sm">Administrer dine projekter</p>
                    </div>
                    <Button
                        variant="primary"
                        size="lg"
                        icon={faPlus}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Nyt projekt
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pb-12">
                {projects.length === 0 ? (
                    <div className="text-center py-12">
                        <FontAwesomeIcon icon={faFolder} className="w-16 h-16 mb-4" style={{ color: colors.border }} />
                        <h3 className="h3 mb-2" style={{ color: colors.textPrimary }}>Ingen projekter endnu</h3>
                        <p className="body-sm mb-6" style={{ color: colors.textSecondary }}>Opret et projekt for at gruppere dine opgaver</p>
                        <Button
                            variant="primary"
                            size="md"
                            icon={faPlus}
                            onClick={() => setShowCreateModal(true)}
                        >
                            Opret dit første projekt
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
                        {/* Table header bar */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                            <span className="label-lg" style={{ color: colors.textPrimary }}>
                                {projects.length} {projects.length === 1 ? "projekt" : "projekter"}
                            </span>
                            <DropdownMenu
                                trigger={
                                    <Button variant="ghost" size="md" className="-mr-2" >
                                        <FontAwesomeIcon icon={faArrowDownWideShort} className="w-4 h-4" />
                                        {sortLabels[sortBy]}
                                        <FontAwesomeIcon icon={faCaretDown} className="w-3 h-3" />
                                    </Button>
                                }
                                items={(["name", "tasks", "created"] as SortKey[]).map((key) => ({
                                    label: sortLabels[key],
                                    checked: sortBy === key,
                                    onClick: () => setSortBy(key),
                                }))}
                            />
                        </div>

                        {/* Rows */}
                        <table className="w-full">
                            <tbody className="divide-y divide-gray-100">
                                {sortedProjects.map((project) => (
                                    <ProjectRow
                                        key={project.project_id}
                                        project={project}
                                        taskCount={taskCounts[project.project_id] ?? 0}
                                        templateCount={templateCounts[project.project_id] ?? 0}
                                        tasks={tasksByProject[project.project_id] ?? []}
                                        onEdit={() => setEditingProject(project)}
                                        onDelete={() => handleDelete(project.project_id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Nyt projekt"
                maxWidth="lg"
                footer={
                    <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                        <Button
                            type="submit"
                            form={createProjectFormId}
                            loading={createLoading}
                            variant="primary"
                            size="md"
                        >
                            Opret projekt
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            disabled={createLoading}
                            variant="secondary"
                            size="md"
                        >
                            Annuller
                        </Button>
                    </div>
                }
            >
                <ProjectForm
                    formId={createProjectFormId}
                    onLoadingChange={setCreateLoading}
                    onSubmit={handleCreate}
                />
            </Modal>

            {/* Edit Modal */}
            {
                editingProject && (
                    <Modal
                        isOpen
                        onClose={() => setEditingProject(null)}
                        title="Rediger projekt"
                        maxWidth="lg"
                        footer={
                            <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                                <Button
                                    type="submit"
                                    form={editProjectFormId}
                                    loading={editLoading}
                                    variant="primary"
                                    size="md"
                                >
                                    Gem ændringer
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setEditingProject(null)}
                                    disabled={editLoading}
                                    variant="secondary"
                                    size="md"
                                >
                                    Annuller
                                </Button>
                            </div>
                        }
                    >
                        <ProjectForm
                            formId={editProjectFormId}
                            onLoadingChange={setEditLoading}
                            initial={editingProject}
                            onSubmit={(input) => handleUpdate(editingProject.project_id, input)}
                        />
                    </Modal>
                )
            }

            {/* Delete Project Confirm Modal */}
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

// ---------------------------------------------------------------------------
// Inline form — simple enough to not warrant its own file
// ---------------------------------------------------------------------------

interface ProjectFormProps {
    formId: string;
    onLoadingChange?: (loading: boolean) => void;
    initial?: Project;
    onSubmit: (input: CreateProjectInput) => Promise<void>;
}

function ProjectForm({ formId, onLoadingChange, initial, onSubmit }: ProjectFormProps) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [color, setColor] = useState(initial?.color ?? "#1B1D22");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) { setError("Navn er påkrævet"); return; }
        setLoading(true);
        setError(null);
        try {
            await onSubmit({ name: name.trim(), description: description.trim() || undefined, color });
        } catch {
            setError("Kunne ikke gemme projekt. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
                <div
                    className="rounded-md border px-4 py-3"
                    style={{
                        borderColor: colors.red,
                        backgroundColor: colors.redLight,
                    }}
                >
                    <p className="body-sm" style={{ color: colors.red }}>{error}</p>
                </div>
            )}

            <div>
                <label className="label-lg mb-2 block">Navn *</label>
                <TextInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Projektnavn"
                />
            </div>

            <div>
                <label className="label-lg mb-2 block">Beskrivelse</label>
                <TextArea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Valgfri beskrivelse"
                />
            </div>

            <div>
                <label className="label-lg mb-2 block">Farve</label>
                <ColorInput
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
            </div>
        </form>
    );
}
