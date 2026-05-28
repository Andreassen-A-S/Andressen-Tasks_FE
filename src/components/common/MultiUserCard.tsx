"use client";

import { useState, type ReactNode } from "react";
import {
    autoUpdate,
    flip,
    offset,
    safePolygon,
    shift,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
    useRole,
    FloatingPortal,
} from "@floating-ui/react";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import type { AvatarUser } from "@/components/common/label/TaskAssignedUsers";

interface MultiUserCardProps {
    users: AvatarUser[];
    children: ReactNode;
}

export default function MultiUserCard({ users, children }: MultiUserCardProps) {
    const [open, setOpen] = useState(false);

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpen,
        placement: "bottom-start",
        whileElementsMounted: autoUpdate,
        middleware: [offset(8), flip(), shift({ padding: 8 })],
    });

    const hover = useHover(context, { move: false, handleClose: safePolygon() });
    const focus = useFocus(context);
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "dialog" });
    const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);
    const { setReference, setFloating } = refs;

    return (
        <>
            <span ref={setReference} {...getReferenceProps()} className="inline-flex">
                {children}
            </span>
            {open && (
                <FloatingPortal>
                    <div
                        ref={setFloating}
                        style={{
                            ...floatingStyles,
                            backgroundColor: "var(--sidebar-bg)",
                            color: "var(--sidebar-text)",
                            border: "1px solid var(--border)",
                        }}
                        {...getFloatingProps()}
                        className="z-9999 rounded-lg p-3 fade-in min-w-50"
                    >
                        <div className="space-y-2">
                            {users.map((u) => (
                                <div key={u.id} className="flex items-center gap-2.5">
                                    <SingleAvatar name={u.name} size="sm" imageUrl={u.profile_picture_url} />
                                    <div>
                                        <div className="label-md">{u.name}</div>
                                        {u.position && (
                                            <div className="body-xs" style={{ color: "var(--sidebar-text-muted)" }}>{u.position}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </FloatingPortal>
            )}
        </>
    );
}
