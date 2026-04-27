import { colors } from "@/constants/colors";
import ProjectIcon from "@/components/common/icons/ProjectIcon";

interface ProjectBadgeProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-xs gap-1",
  md: "text-sm gap-1.5",
  lg: "text-base gap-2",
};

export default function ProjectBadge({ name, size = "md" }: ProjectBadgeProps) {
  return (
    <span className={`inline-flex items-center ${sizeClasses[size]}`} style={{ color: colors.textMuted }}>
      <ProjectIcon className="w-[1em] h-[1em] flex-shrink-0" />
      <span>{name}</span>
    </span>
  );
}
