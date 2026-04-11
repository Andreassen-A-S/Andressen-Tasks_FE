"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner, faFolder } from "@fortawesome/free-solid-svg-icons";
import { getProjects, createProject, updateProject, deleteProject, getTasks } from "@/lib/api";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/types/project";
import ProjectCard from "./ProjectCard";
import Modal from "@/components/modal/Modal";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function ProjectPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        try {
            setLoading(true);
            const [projectsResult, tasksResult] = await Promise.allSettled([getProjects(), getTasks()]);
            if (projectsResult.status === "fulfilled") setProjects(projectsResult.value);
            if (tasksResult.status === "fulfilled") {
                const counts: Record<string, number> = {};
                for (const task of tasksResult.value) {
                    counts[task.project_id] = (counts[task.project_id] ?? 0) + 1;
                }
                setTaskCounts(counts);
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
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-[#0f6e56]" />
                    <div className="text-sm text-gray-500">Indlæser projekter...</div>
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
                        <p className="body-sm">{projects.length} {projects.length === 1 ? "projekt" : "projekter"}</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex btn-lg items-center gap-2 px-5 py-3 bg-[#0f6e56] text-white font-semibold rounded-lg hover:bg-[#0a5551] transition-colors"
                    >
                        <FontAwesomeIcon icon={faPlus} size="sm" />
                        Nyt projekt
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pb-12">
                {projects.length === 0 ? (
                    <div className="text-center py-12">
                        <FontAwesomeIcon icon={faFolder} className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen projekter endnu</h3>
                        <p className="text-gray-500 mb-6">Opret et projekt for at gruppere dine opgaver</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f6e56] text-white font-semibold rounded-lg hover:bg-[#0a5551] transition-colors"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Opret dit første projekt
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.project_id}
                                project={project}
                                taskCount={taskCounts[project.project_id] ?? 0}
                                onEdit={() => setEditingProject(project)}
                                onDelete={() => handleDelete(project.project_id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Nyt projekt"
                maxWidth="lg"
            >
                <ProjectForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowCreateModal(false)}
                    submitLabel="Opret projekt"
                />
            </Modal>

            {/* Edit Modal */}
            {editingProject && (
                <Modal
                    isOpen
                    onClose={() => setEditingProject(null)}
                    title="Rediger projekt"
                    maxWidth="lg"
                >
                    <ProjectForm
                        initial={editingProject}
                        onSubmit={(input) => handleUpdate(editingProject.project_id, input)}
                        onCancel={() => setEditingProject(null)}
                        submitLabel="Gem ændringer"
                    />
                </Modal>
            )}

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
        </div>
    );
}

// ---------------------------------------------------------------------------
// Inline form — simple enough to not warrant its own file
// ---------------------------------------------------------------------------

interface ProjectFormProps {
    initial?: Project;
    onSubmit: (input: CreateProjectInput) => Promise<void>;
    onCancel: () => void;
    submitLabel: string;
}

function ProjectForm({ initial, onSubmit, onCancel, submitLabel }: ProjectFormProps) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [color, setColor] = useState(initial?.color ?? "#1B1D22");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
                <div className="p-4 bg-[#FDECEC] border-l-4 border-[#D64545] rounded-r-lg">
                    <p className="body-sm">{error}</p>
                </div>
            )}

            <div>
                <label className="label-lg mb-2 block">Navn *</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors bg-white text-[#1B1D22]"
                    placeholder="Projektnavn"
                />
            </div>

            <div>
                <label className="label-lg mb-2 block">Beskrivelse</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors bg-white text-[#1B1D22] resize-none"
                    placeholder="Valgfri beskrivelse"
                />
            </div>

            <div>
                <label className="label-lg mb-2 block">Farve</label>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-10 w-16 rounded-lg border border-[#E8E6E1] cursor-pointer p-1"
                    />
                    <span className="body-sm text-gray-500">{color}</span>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row-reverse gap-3 pt-2 border-t border-[#E8E6E1]">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-[#0f6e56] px-5 py-3 btn-lg text-white hover:bg-[#0a5551] transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                >
                    {loading ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4" />
                            <span>Gemmer...</span>
                        </>
                    ) : submitLabel}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-lg bg-white px-5 py-3 btn-lg text-[#1B1D22] border-2 border-[#E8E6E1] hover:bg-[#FAFAF7] disabled:opacity-50 sm:w-auto"
                >
                    Annuller
                </button>
            </div>
        </form>
    );
}
