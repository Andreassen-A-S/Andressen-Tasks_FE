import { TaskEvent } from "@/types/taskEvent";
import { TaskPriority, TaskStatus } from "@/types/task";

export function formatRelativeDate(isoDate: string | Date): string {
  const date =
    typeof isoDate === "string" ? new Date(isoDate.split("T")[0]) : isoDate;

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
    ...(target.getFullYear() !== today.getFullYear() && {
      year: "numeric",
    }),
  });
}

export function formatLocalDate(dateInput: string | Date, locale = "da-DK") {
  const date =
    typeof dateInput === "string"
      ? new Date(dateInput.split("T")[0])
      : dateInput;
  return date.toLocaleDateString(locale);
}

// Used in task details for created_at and updated_at
export function formatDaDateTime(isoDate: string | Date): string {
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

export function formatDaDate(isoDate: string | Date): string {
  const date = typeof isoDate === "string" ? new Date(isoDate) : isoDate;
  if (Number.isNaN(date.getTime())) return "";

  const datePart = date.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${datePart}`;
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

export function isoToDateString(iso: string): string {
  return iso.split("T")[0];
}

// Translation functions
export function translatePriority(priority: string): string {
  switch (priority) {
    case "LOW":
      return "LAV";
    case "MEDIUM":
      return "MELLEM";
    case "HIGH":
      return "HØJ";
    default:
      return priority;
  }
}

export function translateStatus(status: string): string {
  switch (status) {
    case "PENDING":
      return "MANGLER";
    case "DONE":
      return "AFSLUTTET";
    case "REJECTED":
      return "ANNULLERET";
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
  const colors = {
    [TaskStatus.DONE]: "bg-green-100 text-green-600 border-green-200",
    [TaskStatus.PENDING]: "bg-yellow-100 text-yellow-600 border-yellow-200",
    [TaskStatus.REJECTED]: "bg-red-100 text-red-600 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const getPriorityAccentColors = (priority: TaskPriority): string => {
  const colors = {
    [TaskPriority.HIGH]: "bg-red-600",
    [TaskPriority.MEDIUM]: "bg-orange-400",
    [TaskPriority.LOW]: "bg-yellow-400",
  };
  return colors[priority];
};

export const getStatusAccentColors = (status: TaskStatus): string => {
  const colors = {
    [TaskStatus.DONE]: "bg-green-600",
    [TaskStatus.PENDING]: "bg-yellow-600",
    [TaskStatus.REJECTED]: "bg-red-600",
  };
  return colors[status] || "bg-gray-600";
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

export function toIsoEndOfDay(dateString: string): string {
  // Converts YYYY-MM-DD to ISO-8601 DateTime at end of day
  return new Date(dateString + "T23:59:59.000Z").toISOString();
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
    default:
      return "";
  }
}

// For timeline event descriptions

export function getSubtaskInfo(e: TaskEvent) {
  const aj = e.after_json as any;
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
