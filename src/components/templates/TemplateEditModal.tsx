"use client";

import type { RecurringTemplate } from "@/types/recuringTemplate";
import Button from "@/components/common/buttons/Button";
import Modal from "../modal/Modal";
import UpdateTemplateForm from "./UpdateTemplateForm";

interface TemplateEditModalProps {
    template: RecurringTemplate | null;
    isOpen: boolean;
    loading: boolean;
    formId: string;
    onClose: () => void;
    onLoadingChange: (loading: boolean) => void;
    onSuccess: (template: RecurringTemplate) => void;
}

export default function TemplateEditModal({
    template,
    isOpen,
    loading,
    formId,
    onClose,
    onLoadingChange,
    onSuccess,
}: TemplateEditModalProps) {
    if (!isOpen || !template) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Rediger Skabelon"
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
            <UpdateTemplateForm
                formId={formId}
                onLoadingChange={onLoadingChange}
                template={template}
                onSuccess={onSuccess}
            />
        </Modal>
    );
}
