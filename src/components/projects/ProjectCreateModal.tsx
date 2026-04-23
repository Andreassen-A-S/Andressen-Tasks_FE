"use client";

import type { CreateProjectInput } from "@/types/project";
import Modal from "@/components/modal/Modal";
import Button from "@/components/common/buttons/Button";
import ProjectForm from "./ProjectForm";

interface ProjectCreateModalProps {
    isOpen: boolean;
    loading: boolean;
    formId: string;
    onClose: () => void;
    onLoadingChange: (loading: boolean) => void;
    onSubmit: (input: CreateProjectInput) => Promise<void>;
}

export default function ProjectCreateModal({
    isOpen,
    loading,
    formId,
    onClose,
    onLoadingChange,
    onSubmit,
}: ProjectCreateModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nyt projekt"
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
                        Opret projekt
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
                onSubmit={onSubmit}
            />
        </Modal>
    );
}
