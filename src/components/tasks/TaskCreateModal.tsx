"use client";

import Modal from "../modal/Modal";
import Button from "../common/buttons/Button";
import CreateTaskForm from "./createTask/CreateTaskForm";

interface TaskCreateModalProps {
    isOpen: boolean;
    loading: boolean;
    formId: string;
    submitLabel: string;
    onClose: () => void;
    onLoadingChange: (loading: boolean) => void;
    onSubmitLabelChange: (label: string) => void;
    onSuccess: () => void;
}

export default function TaskCreateModal({
    isOpen,
    loading,
    formId,
    submitLabel,
    onClose,
    onLoadingChange,
    onSubmitLabelChange,
    onSuccess,
}: TaskCreateModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Opret Ny Opgave"
            maxWidth="3xl"
            footer={
                <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                    <Button
                        type="submit"
                        form={formId}
                        loading={loading}
                        variant="primary"
                        size="md"
                    >
                        {submitLabel}
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
            <CreateTaskForm
                formId={formId}
                onLoadingChange={onLoadingChange}
                onSubmitLabelChange={onSubmitLabelChange}
                onSuccess={onSuccess}
                onComplete={onSuccess}
            />
        </Modal>
    );
}
