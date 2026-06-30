"use client";

import { useRef, type RefObject } from "react";
import { colors } from "@/constants/colors";

const BOUNDARY = /[\s.,!?;:)\]}>"']/;

function buildHighlightHTML(text: string, pendingMentions: { name: string; userId: string }[]): string {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (!pendingMentions.length) return escape(text) + "​";

  const names = [...new Set(pendingMentions.map((m) => m.name))].sort((a, b) => b.length - a.length);

  let result = "";
  let i = 0;
  while (i < text.length) {
    const at = text.indexOf("@", i);
    if (at === -1) { result += escape(text.slice(i)); break; }
    result += escape(text.slice(i, at));
    let matched = false;
    for (const name of names) {
      const end = at + 1 + name.length;
      if (text.slice(at + 1, end) !== name) continue;
      const next = text[end] ?? "";
      if (next && !BOUNDARY.test(next)) continue;
      result += `<span style="color:var(--accent)">@${escape(name)}</span>`;
      i = end;
      matched = true;
      break;
    }
    if (!matched) { result += "@"; i = at + 1; }
  }
  return result + "​";
}

function findMentionAt(
  text: string,
  pendingMentions: { name: string; userId: string }[],
  deletionPos: number,
): { start: number; end: number } | null {
  if (!pendingMentions.length) return null;
  const names = [...new Set(pendingMentions.map((m) => m.name))].sort((a, b) => b.length - a.length);
  let i = 0;
  while (i < text.length) {
    const at = text.indexOf("@", i);
    if (at === -1) break;
    let matched = false;
    for (const name of names) {
      const end = at + 1 + name.length;
      if (text.slice(at + 1, end) !== name) continue;
      const next = text[end] ?? "";
      if (next && !BOUNDARY.test(next)) continue;
      if (deletionPos >= at && deletionPos < end) return { start: at, end };
      i = end;
      matched = true;
      break;
    }
    if (!matched) i = at + 1;
  }
  return null;
}

interface MentionTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "ref"> {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  pendingMentions: { name: string; userId: string }[];
  // Called whenever an atomic mention delete changes the value. Must be wired
  // to the same handler as onChange so both paths update the same state.
  onValueChange: (value: string) => void;
  sharedClassName?: string;
  textareaClassName?: string;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

export default function MentionTextarea({
  textareaRef,
  pendingMentions,
  onValueChange,
  sharedClassName = "",
  textareaClassName = "",
  containerClassName = "",
  containerStyle,
  style,
  onScroll,
  onKeyDown,
  value,
  ...rest
}: MentionTextareaProps) {
  const highlightRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const isBackspace = e.key === "Backspace";
    const isDelete = e.key === "Delete";

    if ((isBackspace || isDelete) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd } = textarea;

      if (selectionStart !== null && selectionEnd !== null && selectionStart === selectionEnd) {
        const text = String(value ?? "");
        const deletionPos = isBackspace ? selectionStart - 1 : selectionStart;
        const ch = text[deletionPos];

        if (ch !== " " && ch !== "\n" && ch !== undefined) {
          const range = findMentionAt(text, pendingMentions, deletionPos);
          if (range) {
            e.preventDefault();
            const newText = text.slice(0, range.start) + text.slice(range.end);
            onValueChange(newText);
            requestAnimationFrame(() => {
              if (textareaRef.current) {
                textareaRef.current.selectionStart = range.start;
                textareaRef.current.selectionEnd = range.start;
              }
            });
            return;
          }
        }
      }
    }

    onKeyDown?.(e);
  }

  return (
    <div className={`relative ${containerClassName}`} style={containerStyle}>
      <div
        ref={highlightRef}
        aria-hidden
        className={`absolute inset-0 whitespace-pre-wrap break-words overflow-hidden pointer-events-none select-none ${sharedClassName}`}
        style={{ color: colors.textPrimary }}
        dangerouslySetInnerHTML={{ __html: buildHighlightHTML(String(value ?? ""), pendingMentions) }}
      />
      <textarea
        ref={textareaRef}
        value={value}
        className={`relative z-10 bg-transparent ${sharedClassName} ${textareaClassName}`}
        style={{ ...style, color: "transparent", caretColor: colors.textPrimary }}
        onScroll={(e) => {
          if (highlightRef.current) highlightRef.current.scrollTop = e.currentTarget.scrollTop;
          onScroll?.(e);
        }}
        onKeyDown={handleKeyDown}
        {...rest}
      />
    </div>
  );
}
