"use client";

import { useMemo, useState, type KeyboardEvent, type RefObject } from "react";
import type { MentionableUser } from "@/types/users";
import { buildTokenText, extractMentionUserIds, parseTokenMentions, prunePendingMentions } from "@/helpers/mentions";

interface Options {
  mentionableUsers: MentionableUser[];
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  // Pass the raw token text of an existing comment to seed pending mentions on mount.
  initialTokenText?: string;
}

export function useMentionComposer({ mentionableUsers, textareaRef, initialTokenText }: Options) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [pendingMentions, setPendingMentions] = useState<{ name: string; userId: string }[]>(
    () => (initialTokenText ? parseTokenMentions(initialTokenText) : []),
  );

  const mentionCandidates = useMemo<MentionableUser[]>(() => {
    if (mentionQuery === null || !mentionableUsers.length) return [];
    const q = mentionQuery.toLowerCase();
    return mentionableUsers
      .filter((u) => u.name.toLowerCase().split(/\s+/).some((word) => word.startsWith(q)))
      .slice(0, 8);
  }, [mentionQuery, mentionableUsers]);

  // Call after every text change to keep mention query state in sync.
  function onTextChange(value: string) {
    if (!mentionableUsers.length) return;
    const beforeCursor = value.slice(0, textareaRef.current?.selectionStart ?? value.length);
    const lastAt = beforeCursor.lastIndexOf("@");
    if (lastAt === -1 || /\s/.test(beforeCursor.slice(lastAt + 1))) {
      setMentionQuery(null);
      setMentionStart(null);
      setPendingMentions((prev) => prunePendingMentions(prev, value));
      return;
    }
    setMentionQuery(beforeCursor.slice(lastAt + 1));
    setMentionStart(lastAt);
    setSelectedMentionIndex(0);
  }

  // Inserts the selected user into the text. Returns the new text value.
  function selectMention(user: MentionableUser, currentValue: string): string {
    const atIndex = mentionStart ?? 0;
    const queryLen = mentionQuery?.length ?? 0;
    const newText = currentValue.slice(0, atIndex) + `@${user.name} ` + currentValue.slice(atIndex + 1 + queryLen);
    const newCursor = atIndex + user.name.length + 2;
    setMentionQuery(null);
    setMentionStart(null);
    setPendingMentions((prev) =>
      prev.some((m) => m.userId === user.user_id) ? prev : [...prev, { name: user.name, userId: user.user_id }],
    );
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursor;
        textareaRef.current.selectionEnd = newCursor;
        textareaRef.current.focus();
      }
    });
    return newText;
  }

  // Handle mention navigation keys. Returns true if the event was consumed.
  // Pass the current text value and a setter so the hook can insert the mention.
  function mentionKeyDown(
    e: KeyboardEvent,
    currentValue: string,
    onSelect: (newText: string) => void,
  ): boolean {
    if (!mentionCandidates.length) return false;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedMentionIndex((i) => Math.min(i + 1, mentionCandidates.length - 1));
      return true;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedMentionIndex((i) => Math.max(i - 1, 0));
      return true;
    }
    if (e.key === "Escape") {
      setMentionQuery(null);
      setMentionStart(null);
      return true;
    }
    if (e.key === "Enter" || e.key === "Tab") {
      const user = mentionCandidates[selectedMentionIndex];
      if (user) {
        e.preventDefault();
        onSelect(selectMention(user, currentValue));
        return true;
      }
    }
    return false;
  }

  // Serialise display text to token text and extract mention user IDs for submission.
  function buildPayload(displayText: string): { tokenText: string; mentionUserIds: string[] } {
    const tokenText = buildTokenText(displayText, pendingMentions);
    return { tokenText, mentionUserIds: extractMentionUserIds(tokenText) };
  }

  // Reset all mention state after a successful submit.
  function reset() {
    setMentionQuery(null);
    setMentionStart(null);
    setSelectedMentionIndex(0);
    setPendingMentions([]);
  }

  return { pendingMentions, mentionStart, mentionCandidates, selectedMentionIndex, onTextChange, selectMention, mentionKeyDown, buildPayload, reset };
}
