"use client";

import { File, FileText, FileSpreadsheet, FileImage } from "lucide-react";
import { colors } from "@/constants/colors";
import { getFileIcon } from "@/helpers/helpers";

interface Props {
  fileName: string;
  mimeType?: string | null;
  url: string;
}

const FILE_ICON_MAP = {
  "file": File,
  "file-pdf": FileText,
  "file-word": FileText,
  "file-excel": FileSpreadsheet,
  "file-image": FileImage,
} as const;

export default function FileAttachmentCard({ fileName, mimeType, url }: Props) {
  const iconKey = getFileIcon(mimeType);
  const Icon = FILE_ICON_MAP[iconKey];

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
