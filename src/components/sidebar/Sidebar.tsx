"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, Repeat, Users, BarChart2, Settings, LogOut, ChevronsUpDown, Info, ExternalLink, Building2, UserRound, Plus, ChevronDown } from "lucide-react";
import StaffBadge from "@/components/common/label/StaffBadge";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, getUserRoleLabel } from "@/types/users";
import LoginModal from "@/components/auth/LoginModal";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import ProjectIcon from "@/components/common/icons/ProjectIcon";
import { useTopProgress } from "@/components/common/loading/TopProgressProvider";
import { prefetchAdminRoute } from "@/lib/queries/admin";
import DropdownMenu, { DropdownOpenContext } from "@/components/common/DropdownMenu";
import { getOrganization, getOrganizations } from "@/lib/api/organizations";
import { colors } from "@/constants/colors";
import { useContext, useState } from "react";
import Button from "../common/buttons/Button";
import { MESTERPLAN_ORG_ID } from "@/constants/org";

function OrgAvatar({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
    if (logoUrl) {
        return (
            <div className="w-5 h-5 rounded flex-shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt={name} className="w-full h-full object-contain" />
            </div>
        );
    }
    return <SingleAvatar name={name} size="xxs" />;
}

function UserPanelTrigger({ name, role, organizationId, imageUrl }: { name: string; role: string; organizationId: string | null; imageUrl?: string | null }) {
    const isOpen = useContext(DropdownOpenContext);
    return (
        <div className={`flex items-center gap-3 w-full p-4 transition-colors cursor-pointer ${isOpen ? "bg-[var(--sidebar-hover)]" : "hover:bg-[var(--sidebar-hover)]"}`}>
            <SingleAvatar name={name} size="lg" border imageUrl={imageUrl} />
            <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-1.5">
                    <p className="nav-item-active text-white truncate">{name}</p>
                    {organizationId === MESTERPLAN_ORG_ID && <StaffBadge />}
                </div>
                <p className="nav-item" style={{ color: colors.textMuted }}>{role}</p>
            </div>
            <ChevronsUpDown className="w-4 h-4" style={{ color: colors.textMuted }} />
        </div>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, userRole, logout, savedAccounts, switchAccount, contextOrgId, setContextOrg } = useAuth();
    const topProgress = useTopProgress();
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [switchingOrg, setSwitchingOrg] = useState<string | null>(null);

    function switchOrg(orgId: string | null, label: string) {
        setSwitchingOrg(label);
        setContextOrg(orgId);
        queryClient.clear();
        router.push("/");
    }

    const handleLogout = () => {
        logout();
        topProgress.start();
        router.push("/login");
    };

    async function handleNavClick(href: string, event: React.MouseEvent<HTMLAnchorElement>) {
        if (
            href === pathname ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
        ) {
            return;
        }

        event.preventDefault();
        topProgress.start();
        try {
            await prefetchAdminRoute(queryClient, href);
            router.prefetch(href);
        } finally {
            router.push(href);
        }
    }

    const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
    const activeOrgId = contextOrgId ?? user?.organization_id;

    const { data: organizations = [] } = useQuery({
        queryKey: ["organizations"],
        queryFn: getOrganizations,
        enabled: isSuperAdmin,
    });

    const { data: activeOrg, isError: activeOrgError } = useQuery({
        queryKey: ["organizations", activeOrgId],
        queryFn: () => getOrganization(activeOrgId!),
        enabled: !!activeOrgId,
    });

    useEffect(() => {
        if (!switchingOrg) return;
        if (!activeOrgId || activeOrg || activeOrgError) setSwitchingOrg(null);
    }, [switchingOrg, activeOrg, activeOrgId, activeOrgError]);

    const navItems = isSuperAdmin && !contextOrgId ? [
        // SUPER_ADMIN platform mode — org management only
        { href: "/organizations", label: "Organisationer", icon: <Building2 className="w-4 h-4" /> },
        { href: "/employees", label: "Medarbejdere", icon: <Users className="w-4 h-4" /> },
        { href: "/statistics", label: "Statistik", icon: <BarChart2 className="w-4 h-4" /> },
        { href: "/settings", label: "Indstillinger", icon: <Settings className="w-4 h-4" /> },
    ] : [
        // ADMIN or SUPER_ADMIN in org context
        { href: "/tasks", label: "Opgaver", icon: <ClipboardList className="w-4 h-4" /> },
        { href: "/projects", label: "Projekter", icon: <ProjectIcon className="w-3.5 h-3.5" /> },
        { href: "/templates", label: "Gentagende opgaver", icon: <Repeat className="w-4 h-4" /> },
        { href: "/employees", label: "Medarbejdere", icon: <Users className="w-4 h-4" /> },
        { href: `/organizations/${activeOrgId}`, label: "Organisation", icon: <Building2 className="w-4 h-4" /> },
        { href: "/statistics", label: "Statistik", icon: <BarChart2 className="w-4 h-4" /> },
        { href: "/settings", label: "Indstillinger", icon: <Settings className="w-4 h-4" /> },
    ];

    return (
        <>
            {switchingOrg && (
                <div className="fixed inset-0 z-50 flex flex-row items-center justify-center gap-4" style={{ backgroundColor: colors.eggWhite }}>
                    <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: colors.green, borderTopColor: "transparent" }} />
                    <p className="body-sm" style={{ color: colors.textSecondary }}>Skifter til {switchingOrg}…</p>
                </div>
            )}
            <aside className="w-75 bg-sidebar-bg border-r border-[var(--sidebar-border)] h-screen flex flex-col fixed left-0 top-0">
                {/* Header - Brand */}
                <div className="px-6 py-4 border-b border-[var(--sidebar-border)] flex-shrink-0">
                    {activeOrg ? (
                        <Link href="/" className="flex items-center gap-3">
                            {activeOrg.logo_url ? (
                                <div className="w-14 h-14 flex-shrink-0 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={activeOrg.logo_url} alt={activeOrg.name} className="w-full h-full object-contain" />
                                </div>
                            ) : activeOrg.org_id === MESTERPLAN_ORG_ID ? (
                                <div className="w-14 h-14 flex-shrink-0 overflow-hidden">
                                    <Image src="/logo.png" alt="MesterPlan" width={56} height={56} className="w-full h-full object-contain" priority />
                                </div>
                            ) : (
                                <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center bg-[var(--sidebar-active)]">
                                    <Building2 className="w-6 h-6" style={{ color: colors.textMuted }} />
                                </div>
                            )}
                            <div className="min-w-0">
                                <h1 className="sidebar-brand truncate">{activeOrg.name}</h1>
                                <span className="sidebar-brand-sub">{activeOrg.org_id === MESTERPLAN_ORG_ID ? "Platform" : "via MesterPlan"}</span>
                            </div>
                        </Link>
                    ) : (
                        <Link href="/" className="flex items-center gap-3">
                            <Image src="/logo.png" alt="MesterPlan" width={64} height={43} priority />
                            <div>
                                <h1 className="sidebar-brand">MesterPlan</h1>
                                <span className="sidebar-brand-sub">Opgavestyring</span>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Org switcher — SUPER_ADMIN only */}
                {isSuperAdmin && (
                    <div className="p-4 flex-shrink-0 [&>div]:w-full">
                        <DropdownMenu
                            trigger={
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    fullWidth={true}
                                >
                                    <OrgAvatar name={activeOrg?.name ?? "MesterPlan"} logoUrl={(!activeOrg || activeOrg.org_id === MESTERPLAN_ORG_ID) ? (activeOrg?.logo_url ?? "/logo.png") : activeOrg.logo_url} />
                                    <span className="flex-1 text-left nav-item truncate">
                                        {activeOrg ? activeOrg.name : "MesterPlan"}
                                    </span>
                                    <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: colors.navInactive }} />
                                </Button>
                            }
                            items={[
                                {
                                    id: "platform",
                                    label: "MesterPlan",
                                    icon: <OrgAvatar name="MesterPlan" logoUrl={organizations.find(o => o.org_id === MESTERPLAN_ORG_ID)?.logo_url ?? "/logo.png"} />,
                                    badge: <StaffBadge />,
                                    checked: !contextOrgId,
                                    onClick: contextOrgId ? () => switchOrg(null, "Platform") : undefined,
                                },
                                ...organizations.filter(o => o.org_id !== MESTERPLAN_ORG_ID).map(org => ({
                                    id: org.org_id,
                                    label: org.name,
                                    icon: <OrgAvatar name={org.name} logoUrl={org.logo_url} />,
                                    checked: contextOrgId === org.org_id,
                                    onClick: contextOrgId === org.org_id ? undefined : () => switchOrg(org.org_id, org.name),
                                })),
                            ]}
                            width={240}
                        />
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={(event) => handleNavClick(item.href, event)}
                                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive
                                            ? "bg-[var(--sidebar-active)] nav-item-active"
                                            : "nav-item hover:bg-[var(--sidebar-hover)]"
                                            }`}
                                    >
                                        <span className="flex items-center justify-center w-5 h-5">
                                            {item.icon}
                                        </span>
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Profile */}
                <div className="border-t border-[var(--sidebar-border)] shrink-0 mt-auto">
                    <div className="[&>div]:w-full">
                        <DropdownMenu
                            trigger={
                                <UserPanelTrigger
                                    name={user?.name || "Unknown User"}
                                    role={userRole ? getUserRoleLabel(userRole) : "Bruger"}
                                    organizationId={user?.organization_id ?? null}
                                    imageUrl={user?.profile_picture_url}
                                />
                            }
                            items={[
                                { label: user?.email ?? "", disabled: true },
                                { label: "Indstillinger", icon: <Settings className="w-4 h-4" />, onClick: () => router.push("/settings") },
                                {
                                    label: "Skift konto",
                                    icon: <UserRound className="w-4 h-4" />,
                                    subMenuWidth: 220,
                                    subItems: [
                                        ...savedAccounts.map((account) => ({
                                            label: account.user.name,
                                            icon: <SingleAvatar name={account.user.name} size="xxs" imageUrl={account.user.profile_picture_url} />,
                                            badge: account.user.organization_id === MESTERPLAN_ORG_ID ? <StaffBadge /> : undefined,
                                            checked: account.user.user_id === user?.user_id,
                                            onClick: account.user.user_id === user?.user_id
                                                ? undefined
                                                : () => switchAccount(account),
                                        })),
                                        {
                                            label: "Tilføj konto",
                                            icon: <Plus className="w-4 h-4" />,
                                            onClick: () => setShowAddAccount(true),
                                            dividerBefore: savedAccounts.length > 0,
                                        },
                                    ],
                                },
                                {
                                    label: "Læs mere",
                                    icon: <Info className="w-4 h-4" />,
                                    subMenuWidth: 190,
                                    subItems: [
                                        { label: "Privatlivspolitik", href: "/legal/privacy", icon: <ExternalLink className="w-4 h-4 -mr-1" style={{ color: colors.textPrimary }} /> },
                                        { label: "Kontakt support", href: "mailto:henrikandreassen.ha@gmail.com", icon: <ExternalLink className="w-4 h-4 -mr-1" style={{ color: colors.textPrimary }} /> },
                                    ],
                                },
                                { label: "Log ud", icon: <LogOut className="w-4 h-4" />, onClick: handleLogout, danger: true, dividerBefore: true },
                            ]}
                            width={270}
                        />
                    </div>
                </div>
            </aside>

            <LoginModal
                isOpen={showAddAccount}
                onClose={() => setShowAddAccount(false)}
                onSuccess={() => setShowAddAccount(false)}
            />
        </>
    );
}
