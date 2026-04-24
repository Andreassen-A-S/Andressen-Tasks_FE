"use client";

import type { User } from "@/types/users";
import Modal from "../modal/Modal";
import Button from "../common/buttons/Button";
import CreateEmployeeForm from "./CreateEmployeeForm";

interface EmployeeCreateModalProps {
    isOpen: boolean;
    loading: boolean;
    formId: string;
    onClose: () => void;
    onLoadingChange: (loading: boolean) => void;
    onSuccess: (user: User) => void;
}

export default function EmployeeCreateModal({
    isOpen,
    loading,
    formId,
    onClose,
    onLoadingChange,
    onSuccess,
}: EmployeeCreateModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Opret Ny Medarbejder"
            maxWidth="sm"
            footer={
                <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                    <Button
                        type="submit"
                        form={formId}
                        loading={loading}
                        variant="primary"
                        size="md"
                    >
                        Opret medarbejder
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
            <CreateEmployeeForm
                formId={formId}
                onLoadingChange={onLoadingChange}
                onSuccess={onSuccess}
            />
        </Modal>
    );
}
