"use client";

import { File, FileText, FileSpreadsheet, FileImage } from "lucide-react";
import { colors } from "@/constants/colors";
import { getFileIcon } from "@/helpers/helpers";

interface Props {
  fileName: string;
  mimeType?: string | null;
  url: string;
  compact?: boolean;
}

const FILE_ICON_MAP = {
  "file": File,
  "file-pdf": FileText,
  "file-word": FileText,
  "file-excel": FileSpreadsheet,
  "file-image": FileImage,
} as const;

export default function FileAttachmentCard({ fileName, mimeType, url, compact = false }: Props) {
  const iconKey = getFileIcon(mimeType);
  const Icon = FILE_ICON_MAP[iconKey];

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-xl border px-1.5 hover:opacity-80 transition-opacity"
        style={{ borderColor: colors.border, backgroundColor: colors.white, color: colors.textPrimary }}
      >
        <Icon className="w-6 h-6 shrink-0" style={{ color: colors.textPrimary }} />
        <span className="line-clamp-2 w-full mono-xs text-center leading-tight" style={{ color: colors.textMuted }}>{fileName}</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors body-sm hover:opacity-80"
      style={{ borderColor: colors.border, backgroundColor: colors.eggWhite, color: colors.textPrimary }}
    >
      <Icon className="w-4 h-4 shrink-0" style={{ color: colors.textMuted }} />
      <span className="truncate max-w-[200px]">{fileName}</span>
    </a>
  );
}
