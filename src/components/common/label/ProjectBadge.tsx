import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { colors } from "@/constants/colors";

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
      <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 flex-shrink-0" style={{ color: colors.textMuted }} />
      <span>{name}</span>
    </span>
  );
}
