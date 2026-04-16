"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { colors } from "@/constants/colors";
import { getFileIcon } from "@/helpers/helpers";

interface Props {
  fileName: string;
  mimeType?: string | null;
  url: string;
}

export default function FileAttachmentCard({ fileName, mimeType, url }: Props) {
  const icon = getFileIcon(mimeType);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors body-sm hover:opacity-80"
      style={{ borderColor: colors.border, backgroundColor: colors.eggWhite, color: colors.textPrimary }}
    >
      <FontAwesomeIcon icon={icon} style={{ color: colors.textMuted }} className="text-sm shrink-0" />
      <span className="truncate max-w-[200px]">{fileName}</span>
    </a>
  );
}
