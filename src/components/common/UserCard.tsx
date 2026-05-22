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
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/api";
import { UserRole } from "@/types/users";
import type { PositionSummary } from "@/types/position";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import StaffBadge from "@/components/common/label/StaffBadge";
import OutlineBadge from "@/components/common/label/OutlineBadge";

interface UserCardProps {
    userId: string;
    name: string;
    actor?: {
        role?: UserRole | null;
        position?: PositionSummary | null;
    } | null;
    children: ReactNode;
}

export default function UserCard({ userId, name, actor, children }: UserCardProps) {
    const [open, setOpen] = useState(false);

    const isSuperAdmin = actor?.role === UserRole.SUPER_ADMIN;

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpen,
        placement: "top-start",
        whileElementsMounted: autoUpdate,
        middleware: [offset(8), flip(), shift({ padding: 8 })],
    });

    const hover = useHover(context, { move: false, handleClose: safePolygon() });
    const focus = useFocus(context);
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "dialog" });
    const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);
    const { setReference, setFloating } = refs;

    const { data: user, isLoading } = useQuery({
        queryKey: ["user", userId],
        queryFn: () => getUser(userId).catch(() => null),
        enabled: open && !isSuperAdmin,
        staleTime: 5 * 60 * 1000,
    });

    const displayName = user?.name ?? name;
    const displayRole = isSuperAdmin ? UserRole.SUPER_ADMIN : user?.role;
    const displayPosition = isSuperAdmin ? actor?.position : user?.position;

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
                        aria-label={`${displayName} profil`}
                        className="z-[9999] rounded-lg p-4 fade-in pr-10 min-w-[240px]"
                    >
                        {/* Line 1: Avatar */}
                        <SingleAvatar name={displayName} size="lg" />

                        {/* Line 2: Name + email */}
                        <div className="mt-2">
                            <span className="label-lg">{displayName}</span>
                            {!isSuperAdmin && user?.email && (
                                <span className="body-xs ml-2" style={{ color: "var(--sidebar-text-muted)" }}>{user.email}</span>
                            )}
                        </div>

                        {/* Line 3: Role / position badge */}
                        {(isSuperAdmin || (!isLoading && displayRole && displayRole !== UserRole.USER)) && (
                            <div className="mt-1">
                                {displayRole === UserRole.SUPER_ADMIN
                                    ? <StaffBadge />
                                    : displayRole === UserRole.ADMIN
                                        ? <OutlineBadge label="Administrator" />
                                        : displayPosition?.name
                                            ? <OutlineBadge label={displayPosition.name} />
                                            : null
                                }
                            </div>
                        )}

                        {/* Line 4: Org (only for regular org users) */}
                        {!isSuperAdmin && user?.organization?.name && (
                            <div className="mt-1 flex items-center gap-1.5 body-xs" style={{ color: "var(--sidebar-text-muted)" }}>
                                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Medlem af{" "}
                                    <Link
                                        href={`/organizations/${user.organization_id}`}
                                        className="underline transition-colors text-[var(--sidebar-text)] hover:text-[var(--link-hover)]"
                                    >
                                        {user.organization.name}
                                    </Link>
                                </span>
                            </div>
                        )}

                        {!isSuperAdmin && isLoading && (
                            <div className="mt-2 space-y-2">
                                <div className="h-3 w-32 rounded animate-pulse" style={{ backgroundColor: "var(--sidebar-hover)" }} />
                                <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: "var(--sidebar-hover)" }} />
                            </div>
                        )}
                    </div>
                </FloatingPortal>
            )}
        </>
    );
}
