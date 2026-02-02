export function formatRelativeDate(isoDate: string | Date): string {
  const date =
    typeof isoDate === "string"
      ? new Date(isoDate.split("T")[0]) // 👈 vigtigt
      : isoDate;

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
