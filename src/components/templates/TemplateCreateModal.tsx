"use client";

import type { RecurringTemplate } from "@/types/recuringTemplate";
import Button from "@/components/common/buttons/Button";
import Modal from "../modal/Modal";
import CreateTemplateForm from "@/components/templates/CreateTemplateForm";

interface TemplateCreateModalProps {
    isOpen: boolean;
    loading: boolean;
    formId: string;
    onClose: () => void;
    onLoadingChange: (loading: boolean) => void;
    onSuccess: (template: RecurringTemplate) => void;
}

export default function TemplateCreateModal({
    isOpen,
    loading,
    formId,
    onClose,
    onLoadingChange,
    onSuccess,
}: TemplateCreateModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Opret Ny Skabelon"
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
                        Opret gentagende opgave
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
            <CreateTemplateForm
                formId={formId}
                onLoadingChange={onLoadingChange}
                onSuccess={onSuccess}
            />
        </Modal>
    );
}
