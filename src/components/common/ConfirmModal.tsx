"use client";

import Modal from "@/components/modal/Modal";
import { colors } from "@/constants/colors";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg btn-md transition-colors disabled:opacity-50"
            style={{
              backgroundColor: colors.muted,
              color: colors.textPrimary,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.border)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.muted)}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg btn-md transition-opacity disabled:opacity-50"
            style={danger
              ? { backgroundColor: "transparent", color: colors.red, border: `1px solid ${colors.red}` }
              : { backgroundColor: colors.green, color: colors.textWhite }
            }
            onMouseEnter={(e) => { if (danger) { e.currentTarget.style.backgroundColor = colors.red; e.currentTarget.style.color = colors.textWhite; } }}
            onMouseLeave={(e) => { if (danger) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = colors.red; } }}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="body-md" style={{ color: colors.textSecondary }}>
        {description}
      </p>
    </Modal>
  );
}
