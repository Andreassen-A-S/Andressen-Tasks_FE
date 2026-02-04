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
