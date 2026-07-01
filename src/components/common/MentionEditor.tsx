"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import HardBreak from "@tiptap/extension-hard-break";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import type { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";
import { FloatingPortal, autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react";
import type { MentionableUser } from "@/types/users";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import { colors } from "@/constants/colors";
import { tokenTextToTiptap, emptyDoc } from "@/lib/tiptapMentions";

export interface MentionEditorHandle {
  clear: () => void;
  focus: () => void;
}

interface Props {
  initialTokenText?: string;
  mentionableUsers: MentionableUser[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onUpdate: (state: { isEmpty: boolean; json: JSONContent }) => void;
  onSubmit?: () => void;
}

interface SuggestionState {
  items: MentionableUser[];
  selectedIndex: number;
  command: (user: MentionableUser) => void;
  clientRect: (() => DOMRect | null) | null;
}

// Floating dropdown that positions using Floating UI anchored to the caret rect
function MentionSuggestionDropdown({
  suggestion,
}: {
  suggestion: SuggestionState;
}) {
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  const { refs, floatingStyles, isPositioned } = useFloating({
    placement: "top-start",
    strategy: "fixed",
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  // Wire virtual reference using clientRect from Tiptap suggestion
  useEffect(() => {
    if (!suggestion.clientRect) {
      refs.setReference(null);
      return;
    }
    refs.setReference({
      getBoundingClientRect: () => suggestion.clientRect!() ?? new DOMRect(),
    });
  }, [suggestion.clientRect, refs]);

  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [suggestion.selectedIndex]);

  if (suggestion.items.length === 0) return null;

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={{
          ...floatingStyles,
          visibility: isPositioned ? "visible" : "hidden",
          border: `1px solid ${colors.border}`,
          backgroundColor: colors.white,
          boxShadow: "var(--shadow-elevated)",
          minWidth: 200,
          maxWidth: 320,
        }}
        className={`z-[9999] rounded-lg py-1.5 overflow-y-auto max-h-60${isPositioned ? " animate-in fade-in zoom-in-95 ease-out" : ""}`}
        onMouseDown={(e) => e.preventDefault()}
      >
        {suggestion.items.map((user, i) => (
          <div key={user.user_id} className="px-1.5">
            <button
              ref={i === suggestion.selectedIndex ? selectedItemRef : undefined}
              type="button"
              data-active={i === suggestion.selectedIndex || undefined}
              onMouseDown={(e) => {
                e.preventDefault();
                suggestion.command(user);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md body-sm text-left outline-none transition-colors hover:bg-surface-subtle data-[active]:bg-surface-subtle"
              style={{ color: colors.textPrimary }}
            >
              <SingleAvatar name={user.name} size="xs" imageUrl={user.profile_picture_url} />
              <span>{user.name}</span>
            </button>
          </div>
        ))}
      </div>
    </FloatingPortal>
  );
}

const MentionEditor = forwardRef<MentionEditorHandle, Props>(function MentionEditor(
  {
    initialTokenText,
    mentionableUsers,
    placeholder,
    disabled = false,
    className,
    style,
    onUpdate,
    onSubmit,
  },
  ref,
) {
  const [suggestion, setSuggestion] = useState<SuggestionState | null>(null);

  // Use a ref so Tiptap's non-React suggestion callbacks can read current state
  const suggestionRef = useRef<SuggestionState | null>(null);
  suggestionRef.current = suggestion;

  const mentionableUsersRef = useRef(mentionableUsers);
  mentionableUsersRef.current = mentionableUsers;

  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // Stable suggestion render callbacks — created once, read from refs at call time
  const suggestionRender = useCallback(() => {
    return {
      onStart(props: SuggestionProps<MentionableUser>) {
        setSuggestion({
          items: props.items,
          selectedIndex: 0,
          command: (user: MentionableUser) =>
            props.command({ id: user.user_id, label: user.name }),
          clientRect: props.clientRect ?? null,
        });
      },
      onUpdate(props: SuggestionProps<MentionableUser>) {
        setSuggestion((prev) =>
          prev
            ? {
                ...prev,
                items: props.items,
                selectedIndex: 0,
                command: (user: MentionableUser) =>
                  props.command({ id: user.user_id, label: user.name }),
                clientRect: props.clientRect ?? null,
              }
            : null,
        );
      },
      onExit() {
        setSuggestion(null);
      },
      onKeyDown({ event }: SuggestionKeyDownProps): boolean {
        const s = suggestionRef.current;
        if (!s || s.items.length === 0) return false;

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSuggestion((prev) =>
            prev
              ? { ...prev, selectedIndex: Math.min(prev.selectedIndex + 1, prev.items.length - 1) }
              : null,
          );
          return true;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSuggestion((prev) =>
            prev ? { ...prev, selectedIndex: Math.max(prev.selectedIndex - 1, 0) } : null,
          );
          return true;
        }
        if (event.key === "Escape") {
          setSuggestion(null);
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          const user = s.items[s.selectedIndex];
          if (user) {
            s.command(user);
            setSuggestion(null);
            return true;
          }
        }
        return false;
      },
    };
  }, []);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            "Shift-Enter": () => this.editor.commands.setHardBreak(),
          };
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "",
      }),
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        renderHTML({ node }) {
          return [
            "span",
            {
              class: "mention",
              "data-id": node.attrs.id,
              "data-label": node.attrs.label,
            },
            `@${node.attrs.label ?? node.attrs.id ?? ""}`,
          ];
        },
        suggestion: {
          char: "@",
          // Only trigger @ when preceded by whitespace or start of line
          allowedPrefixes: [" ", "\n"],
          items({ query }: { query: string }) {
            const q = query.toLowerCase();
            return mentionableUsersRef.current
              .filter((u) => u.name.toLowerCase().split(/\s+/).some((word) => word.startsWith(q)))
              .slice(0, 8);
          },
          render: suggestionRender,
        },
      }),
    ],
    content: initialTokenText ? tokenTextToTiptap(initialTokenText) : emptyDoc,
    editable: !disabled,
    onUpdate({ editor: e }) {
      onUpdateRef.current({ isEmpty: e.isEmpty, json: e.getJSON() });
    },
    editorProps: {
      handleKeyDown(view, event) {
        // Cmd/Ctrl+Enter → submit
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          onSubmitRef.current?.();
          return true;
        }
        return false;
      },
    },
  });

  // Sync disabled state
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useImperativeHandle(ref, () => ({
    clear() {
      editor?.commands.clearContent(true);
    },
    focus() {
      editor?.commands.focus();
    },
  }));

  return (
    <>
      <div
        className={`cursor-text ${className ?? ""}`}
        style={style}
        onClick={() => {
          if (!editor?.isFocused) editor?.commands.focus();
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {suggestion && <MentionSuggestionDropdown suggestion={suggestion} />}
    </>
  );
});

export default MentionEditor;
