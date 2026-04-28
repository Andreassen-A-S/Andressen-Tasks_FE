import { TaskEvent } from "@/types/taskEvent";
import { TaskPriority, TaskStatus } from "@/types/task";
import { TaskAssignment } from "@/types/assignment";
import {
  faFile,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileImage,
} from "@fortawesome/free-solid-svg-icons";
import { AllowedMimeType } from "@/types/attachment";

function parseDateInput(dateInput: string | Date): Date {
  if (dateInput instanceof Date) return dateInput;

  const datePart = dateInput.split("T")[0];
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(datePart);
  if (isDateOnly) {
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(dateInput);
}

export function formatRelativeDate(isoDate: string | Date): string {
  const date = parseDateInput(isoDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "I dag";
  if (diffDays === 1) return "I morgen";
  if (diffDays === -1) return "I går";

  return target.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    ...(target.getFullYear() !== today.getFullYear() && { year: "numeric" }),
  });
}

export function formatLocalDate(
  dateInput: string | Date,
  locale = "da-DK",
  options?: Intl.DateTimeFormatOptions,
) {
  const date = parseDateInput(dateInput);
  return date.toLocaleDateString(locale, options);
}

export function toDateKey(dateInput: string | Date): string {
  const date = parseDateInput(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Used in task details for created_at and updated_at
export function formatDateTime(isoDate: string | Date): string {
  const date = typeof isoDate === "string" ? new Date(isoDate) : isoDate;
  if (Number.isNaN(date.getTime())) return "";

  const datePart = date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const timePart = date
    .toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(":", ".");

  return `${datePart} ${timePart}`;
}

export function formatDate(isoDate: string | Date): string {
  const date = parseDateInput(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCommentDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Lige nu";
  if (diffMins < 60) return `${diffMins} min siden`;
  if (diffHours < 24) return `${diffHours} timer siden`;
  if (diffDays < 7) {
    const dayLabel = diffDays === 1 ? "dag" : "dage";
    return `${diffDays} ${dayLabel} siden`;
  }

  return date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// Convert YYYY-MM-DD to a full ISO 8601 UTC string for API submission
export function toIsoDate(dateString: string): string {
  return dateString + "T00:00:00.000Z";
}

// Translation functions
export function translatePriority(priority: string): string {
  switch (priority) {
    case "LOW":
      return "Lav";
    case "MEDIUM":
      return "Mellem";
    case "HIGH":
      return "Høj";
    default:
      return priority;
  }
}

export function translateStatus(status: string): string {
  switch (status) {
    case "PENDING":
      return "Mangler";
    case "DONE":
      return "Udført";
    case "REJECTED":
      return "Annulleret";
    case "IN_PROGRESS":
      return "I gang";
    case "ARCHIVED":
      return "Arkiveret";
    default:
      return status;
  }
}

export function translateStatusLowercase(status: string): string {
  switch (status) {
    case "PENDING":
      return "mangler";
    case "DONE":
      return "afsluttet";
    case "REJECTED":
      return "annulleret";
    case "IN_PROGRESS":
      return "i gang";
    case "ARCHIVED":
      return "arkiveret";
    default:
      return status;
  }
}

export const getPriorityColors = (priority: TaskPriority): string => {
  const colors = {
    [TaskPriority.HIGH]: "bg-red-100 text-red-600 border-red-200",
    [TaskPriority.MEDIUM]: "bg-orange-100 text-orange-600 border-orange-200",
    [TaskPriority.LOW]: "bg-yellow-100 text-yellow-600 border-yellow-200",
  };
  return colors[priority];
};

export const getStatusColors = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    [TaskStatus.DONE]: "bg-green-100 text-green-600 border-green-200",
    [TaskStatus.PENDING]: "bg-yellow-100 text-yellow-600 border-yellow-200",
    [TaskStatus.REJECTED]: "bg-red-100 text-red-600 border-red-200",
    [TaskStatus.IN_PROGRESS]: "bg-blue-100 text-blue-600 border-blue-200",
    [TaskStatus.ARCHIVED]: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const getPriorityAccentColors = (
  priority: TaskPriority,
): { accent: string; bg: string } => {
  const map = {
    [TaskPriority.HIGH]: { accent: "red-600", bg: "red-100" },
    [TaskPriority.MEDIUM]: { accent: "orange-400", bg: "orange-100" },
    [TaskPriority.LOW]: { accent: "yellow-400", bg: "yellow-100" },
  };
  return map[priority];
};

export const getStatusAccentColors = (
  status: TaskStatus,
): { accent: string; bg: string } => {
  const map: Record<TaskStatus, { accent: string; bg: string }> = {
    [TaskStatus.DONE]: { accent: "green-600", bg: "green-100" },
    [TaskStatus.PENDING]: { accent: "yellow-400", bg: "yellow-100" },
    [TaskStatus.REJECTED]: { accent: "red-600", bg: "red-100" },
    [TaskStatus.IN_PROGRESS]: { accent: "blue-600", bg: "blue-100" },
    [TaskStatus.ARCHIVED]: { accent: "gray-600", bg: "gray-100" },
  };
  return map[status] ?? { accent: "gray-600", bg: "gray-100" };
};

// Avatar utilities
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

export function getAvatarColor(name: string): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-cyan-500",
  ];

  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function getAuthHeaders(): HeadersInit {
  // Check if we're in the browser before accessing localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export function translateTaskUnit(unit?: string | null): string {
  switch (unit) {
    case "HOURS":
      return "timer";
    case "METERS":
      return "m";
    case "KILOMETERS":
      return "km";
    case "LITERS":
      return "l";
    case "KILOGRAMS":
      return "kg";
    case "M2":
      return "m²";
    case "M3":
      return "m³";
    case "LOADS":
      return "læs";
    case "PLUGS":
      return "stik";
    case "TONS":
      return "t";
    case "NONE":
      return "%";
    default:
      return "";
  }
}

// Count tasks assigned for today and completed today
export function getTodayAssignmentStats(assignments: TaskAssignment[]) {
  const today = toDateKey(new Date());

  const assignedToday = assignments.filter(
    (a) => a.task?.start_date && toDateKey(a.task.start_date) === today,
  ).length;

  const completedToday = assignments.filter(
    (a) => a.completed_at && toDateKey(a.completed_at) === today,
  ).length;

  return {
    assignedToday,
    completedToday,
  };
}

// For timeline event descriptions

export function getSubtaskInfo(e: TaskEvent) {
  const aj = e.after_json as
    | { task_id?: string; title?: string }
    | null
    | undefined;
  return {
    id: aj?.task_id as string | undefined,
    title: aj?.title as string | undefined,
  };
}

// Utility to remove undefined values from an object before sending to API

export function removeUndefined<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export function getFileExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 && i < name.length - 1 ? name.slice(i + 1) : "fil";
}

export function getFileIcon(mimeType?: string | null) {
  if (!mimeType) return faFile;
  if (mimeType === AllowedMimeType.PDF) return faFilePdf;
  if (mimeType === AllowedMimeType.DOCX) return faFileWord;
  if (mimeType === AllowedMimeType.XLSX) return faFileExcel;
  if (
    mimeType === AllowedMimeType.JPEG ||
    mimeType === AllowedMimeType.PNG ||
    mimeType === AllowedMimeType.WEBP ||
    mimeType === AllowedMimeType.HEIC
  )
    return faFileImage;
  return faFile;
}

export function parseLocalizedNumber(value: string): number {
  const s = value.trim().replace(/[\s ]/g, "");
  if (!s) return NaN;
  if ((s.match(/,/g) ?? []).length > 1) return NaN;

  // Both separators: '.' is thousands, ',' is decimal  (e.g. "1.234,56")
  if (s.includes(".") && s.includes(",")) {
    if (!/^-?\d{1,3}(\.\d{3})+,\d+$/.test(s)) return NaN;
    return Number(s.replace(/\./g, "").replace(",", "."));
  }
  // Only comma: da-DK decimal separator (e.g. "1,5")
  if (s.includes(",")) {
    if (!/^-?\d+,\d+$/.test(s)) return NaN;
    return Number(s.replace(",", "."));
  }
  // Only dot: thousands pattern if groups of 3 (e.g. "1.234"), else decimal
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    return Number(s.replace(/\./g, ""));
  }
  if (s.includes(".") && !/^-?\d+\.\d+$/.test(s)) return NaN;
  if (!/^-?\d+(\.\d+)?$/.test(s)) return NaN;
  return Number(s);
}

export function formatNumber(value: number | string): string {
  if (typeof value === "number") return value.toLocaleString("da-DK");

  const trimmed = value.trim();
  if (!trimmed) return value;

  const numericValue = Number(trimmed);
  return Number.isFinite(numericValue) ? numericValue.toLocaleString("da-DK") : value;
}
