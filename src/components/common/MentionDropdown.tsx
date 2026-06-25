"use client";

import { useEffect, useRef } from "react";
import { autoUpdate, flip, offset, shift, useFloating, FloatingPortal } from "@floating-ui/react";
import type { MentionableUser } from "@/types/users";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import { colors } from "@/constants/colors";

interface Props {
    anchor: HTMLElement | null;
    users: MentionableUser[];
    selectedIndex: number;
    onSelect: (user: MentionableUser) => void;
}

export default function MentionDropdown({ anchor, users, selectedIndex, onSelect }: Props) {
    const selectedItemRef = useRef<HTMLButtonElement>(null);

    const { refs, floatingStyles, isPositioned } = useFloating({
        placement: "top-start",
        strategy: "fixed",
        transform: false,
        whileElementsMounted: autoUpdate,
        middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
    });

    useEffect(() => {
        refs.setReference(anchor);
    }, [anchor, refs]);

    useEffect(() => {
        selectedItemRef.current?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    if (users.length === 0) return null;

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
                {users.map((user, i) => (
                    <div key={user.user_id} className="px-1.5">
                        <button
                            ref={i === selectedIndex ? selectedItemRef : undefined}
                            type="button"
                            data-active={i === selectedIndex || undefined}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onSelect(user);
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
