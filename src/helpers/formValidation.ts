export function formatMissingRequiredFields(fields: string[]) {
  if (fields.length === 0) return "";
  if (fields.length === 1) return fields[0];
  if (fields.length === 2) return fields.join(" og ");
  return `${fields.slice(0, -1).join(", ")} og ${fields.at(-1)}`;
}
