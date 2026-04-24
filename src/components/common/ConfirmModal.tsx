"use client";

import Modal from "@/components/modal/Modal";
import Button from "@/components/common/buttons/Button";
import { colors } from "@/constants/colors";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Bekræft",
  cancelLabel = "Annuller",
  danger = false,
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            variant="secondary"
            size="md"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            loading={loading}
            variant={danger ? "danger" : "primary"}
            size="md"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="body-md" style={{ color: colors.textSecondary }}>
        {description}
      </p>
    </Modal>
  );
}
