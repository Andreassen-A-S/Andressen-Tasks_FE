"use client";

import type { CreateProjectInput, Project } from "@/types/project";
import Modal from "@/components/modal/Modal";
import Button from "@/components/common/buttons/Button";
import ProjectForm from "./ProjectForm";

interface ProjectEditModalProps {
    project: Project | null;
    loading: boolean;
    formId: string;
    onClose: () => void;
    onLoadingChange: (loading: boolean) => void;
    onSubmit: (projectId: string, input: CreateProjectInput) => Promise<void>;
}

export default function ProjectEditModal({
    project,
    loading,
    formId,
    onClose,
    onLoadingChange,
    onSubmit,
}: ProjectEditModalProps) {
    if (!project) return null;

    return (
        <Modal
            isOpen
            onClose={onClose}
            title="Rediger projekt"
            maxWidth="lg"
            footer={
                <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                    <Button
                        type="submit"
                        form={formId}
                        loading={loading}
                        variant="primary"
                        size="md"
                    >
                        Gem ændringer
                    </Button>
                    <Button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        variant="secondary"
                        size="md"
                    >
                        Annuller
                    </Button>
                </div>
            }
        >
            <ProjectForm
                formId={formId}
                onLoadingChange={onLoadingChange}
                initial={project}
                onSubmit={(input) => onSubmit(project.project_id, input)}
            />
        </Modal>
    );
}
