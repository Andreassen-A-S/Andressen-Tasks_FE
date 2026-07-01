import type { JSONContent } from "@tiptap/core";

const TOKEN_RE = /@\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Parses `@[name](id)` token text into Tiptap doc JSON.
 * Split on `\n` for paragraphs.
 */
export function tokenTextToTiptap(tokenText: string): JSONContent {
  const lines = tokenText.split("\n");

  const paragraphs: JSONContent[] = lines.map((line) => {
    if (!line) {
      return { type: "paragraph" };
    }

    const content: JSONContent[] = [];
    let lastIndex = 0;
    TOKEN_RE.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = TOKEN_RE.exec(line)) !== null) {
      const [full, name, id] = match;
      const before = line.slice(lastIndex, match.index);
      if (before) {
        content.push({ type: "text", text: before });
      }
      content.push({
        type: "mention",
        attrs: { id, label: name },
      });
      lastIndex = match.index + full.length;
    }

    const after = line.slice(lastIndex);
    if (after) {
      content.push({ type: "text", text: after });
    }

    return {
      type: "paragraph",
      content: content.length > 0 ? content : undefined,
    };
  });

  return { type: "doc", content: paragraphs };
}

/**
 * Walks Tiptap doc JSON, emitting `@[name](id)` for mention nodes,
 * plain text for text nodes, `\n` between paragraphs. Trims trailing newlines.
 */
export function tiptapToTokenText(json: JSONContent): string {
  const parts: string[] = [];

  function walkNode(node: JSONContent) {
    if (node.type === "doc") {
      const children = node.content ?? [];
      children.forEach((child, i) => {
        walkNode(child);
        if (i < children.length - 1) {
          parts.push("\n");
        }
      });
    } else if (node.type === "paragraph") {
      (node.content ?? []).forEach(walkNode);
    } else if (node.type === "hardBreak") {
      parts.push("\n");
    } else if (node.type === "text") {
      parts.push(node.text ?? "");
    } else if (node.type === "mention") {
      const { id, label } = node.attrs ?? {};
      parts.push(`@[${label ?? ""}](${id ?? ""})`);
    }
  }

  walkNode(json);

  // Trim trailing newlines
  let result = parts.join("");
  result = result.replace(/\n+$/, "");
  return result;
}

/**
 * Extracts unique mention user IDs directly from a Tiptap JSON doc.
 */
export function extractMentionUserIdsFromJson(json: JSONContent): string[] {
  const ids: string[] = [];

  function walk(node: JSONContent) {
    if (node.type === "mention") {
      const id = node.attrs?.id as string | undefined;
      if (id && !ids.includes(id)) ids.push(id);
    }
    (node.content ?? []).forEach(walk);
  }

  walk(json);
  return ids;
}

export const emptyDoc: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };
