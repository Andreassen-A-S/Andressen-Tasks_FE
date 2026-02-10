export function formatRelativeDate(isoDate: string | Date): string {
  const date =
    typeof isoDate === "string" ? new Date(isoDate.split("T")[0]) : isoDate;

  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "i dag";
  if (diffDays === 1) return "i morgen";
  if (diffDays === -1) return "i går";

  return target.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    ...(target.getFullYear() !== today.getFullYear() && {
      year: "numeric",
    }),
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
  if (diffDays < 7) return `${diffDays} dage siden`;

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
