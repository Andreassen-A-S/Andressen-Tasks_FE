"use client";

import { useEffect, useRef } from "react";
import { autoUpdate, flip, offset, shift, useFloating, FloatingPortal } from "@floating-ui/react";
import type { MentionableUser } from "@/types/users";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import { colors } from "@/constants/colors";

interface Props {
    anchor: HTMLTextAreaElement | null;
    anchorIndex: number | null;
    users: MentionableUser[];
    selectedIndex: number;
    onSelect: (user: MentionableUser) => void;
}

function getCaretRect(el: HTMLTextAreaElement, index: number): DOMRect {
    const computed = getComputedStyle(el);
    const mirror = document.createElement("div");
    const elRect = el.getBoundingClientRect();

    Object.assign(mirror.style, {
        position: "fixed",
        top: `${elRect.top}px`,
        left: `${elRect.left}px`,
        width: `${elRect.width}px`,
        height: "auto",
        visibility: "hidden",
        pointerEvents: "none",
        overflow: "hidden",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
    });

    [
        "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
        "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
        "fontFamily", "fontSize", "fontWeight", "fontStyle",
        "lineHeight", "letterSpacing", "wordSpacing", "textTransform", "boxSizing",
    ].forEach(prop => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mirror.style as any)[prop] = (computed as any)[prop];
    });

    mirror.appendChild(document.createTextNode(el.value.substring(0, index)));
    const span = document.createElement("span");
    span.textContent = "​";
    mirror.appendChild(span);

    document.body.appendChild(mirror);
    const spanRect = span.getBoundingClientRect();
    const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.2;
    document.body.removeChild(mirror);

    // subtract textarea's scrollTop because the mirror lays out at scrollTop=0
    const top = spanRect.top - el.scrollTop;
    const left = spanRect.left;

    return {
        x: left, y: top, width: 0, height: lineHeight,
        top, right: left, bottom: top + lineHeight, left,
        toJSON() { return this; },
    } as DOMRect;
}

export default function MentionDropdown({ anchor, anchorIndex, users, selectedIndex, onSelect }: Props) {
    const selectedItemRef = useRef<HTMLButtonElement>(null);

    const { refs, floatingStyles, isPositioned } = useFloating({
        placement: "top-start",
        strategy: "fixed",
        transform: false,
        whileElementsMounted: autoUpdate,
        middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
    });

    useEffect(() => {
        if (!anchor || anchorIndex === null) {
            refs.setReference(null);
            return;
        }
        refs.setReference({
            getBoundingClientRect: () => getCaretRect(anchor, anchorIndex),
            contextElement: anchor,
        });
    }, [anchor, anchorIndex, refs]);

    useEffect(() => {
        selectedItemRef.current?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    if (users.length === 0) return null;

    const { setFloating } = refs;

    return (
        <FloatingPortal>
            <div
                ref={setFloating}
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
