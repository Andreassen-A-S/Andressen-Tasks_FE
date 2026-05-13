"use client";

import Modal from "@/components/modal/Modal";
import Button from "@/components/common/buttons/Button";
import CreateOrganizationForm from "./CreateOrganizationForm";

interface OrganizationCreateModalProps {
    isOpen: boolean;
    loading: boolean;
    formId: string;
    onClose: () => void;
    onLoadingChange: (loading: boolean) => void;
    onSuccess: () => void;
}

export default function OrganizationCreateModal({
    isOpen,
    loading,
    formId,
    onClose,
    onLoadingChange,
    onSuccess,
}: OrganizationCreateModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Opret ny organisation"
            maxWidth="sm"
            footer={
                <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                    <Button type="submit" form={formId} loading={loading} variant="primary" size="md">
                        Opret organisation
                    </Button>
                    <Button type="button" onClick={onClose} disabled={loading} variant="secondary" size="md">
                        Annuller
                    </Button>
                </div>
            }
        >
            <CreateOrganizationForm
                formId={formId}
                onLoadingChange={onLoadingChange}
                onSuccess={onSuccess}
            />
        </Modal>
    );
}
