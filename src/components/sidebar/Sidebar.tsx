"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, Repeat, Users, BarChart2, Settings, LogOut, ChevronsUpDown, Info, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import ProjectIcon from "@/components/common/icons/ProjectIcon";
import { useTopProgress } from "@/components/common/loading/TopProgressProvider";
import { prefetchAdminRoute } from "@/lib/queries/admin";
import DropdownMenu, { DropdownOpenContext } from "@/components/common/DropdownMenu";
import { colors } from "@/constants/colors";
import { useContext } from "react";

function UserPanelTrigger({ name, role }: { name: string; role: string }) {
    const isOpen = useContext(DropdownOpenContext);
    return (
        <div className={`flex items-center gap-3 w-full p-4 transition-colors cursor-pointer ${isOpen ? "bg-[rgba(255,255,255,0.06)]" : "hover:bg-[rgba(255,255,255,0.06)]"}`}>
            <SingleAvatar name={name} size="lg" />
            <div className="min-w-0 flex-1 text-left">
                <p className="nav-item-active text-white truncate">{name}</p>
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
    const { user, userRole, logout } = useAuth();
    const topProgress = useTopProgress();
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

    const navItems = [
        { href: "/tasks", label: "Opgaver", icon: <ClipboardList className="w-4 h-4" /> },
        { href: "/projects", label: "Projekter", icon: <ProjectIcon className="w-3.5 h-3.5" /> },
        { href: "/templates", label: "Gentagende opgaver", icon: <Repeat className="w-4 h-4" /> },
        { href: "/employees", label: "Medarbejdere", icon: <Users className="w-4 h-4" /> },
        { href: "/statistics", label: "Statistik", icon: <BarChart2 className="w-4 h-4" /> },
        { href: "/settings", label: "Indstillinger", icon: <Settings className="w-4 h-4" /> },
    ];

    return (
        <aside className="w-75 bg-[#1B1D22] border-r border-[rgba(255,255,255,0.06)] h-screen flex flex-col fixed left-0 top-0">
            {/* Header - Brand */}
            <div className="p-6 border-b border-[rgba(255,255,255,0.06)] flex-shrink-0">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="MesterPlan" width={80} />
                    <div>
                        <h1 className="sidebar-brand">MesterPlan</h1>
                        <span className="sidebar-brand-sub">Opgavestyring</span>
                    </div>
                </Link>
            </div>

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
                                        ? "bg-[rgba(255,255,255,0.08)] nav-item-active"
                                        : "nav-item hover:bg-gray-700 hover:text-white"
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
            <div className="border-t border-[rgba(255,255,255,0.06)] shrink-0 mt-auto">
                <div className="[&>div]:w-full">
                    <DropdownMenu
                        trigger={
                            <UserPanelTrigger
                                name={user?.name || "Unknown User"}
                                role={userRole === "ADMIN" ? "Administrator" : "Bruger"}
                            />
                        }
                        items={[
                            { label: user?.email ?? "", disabled: true },
                            { label: "Indstillinger", icon: <Settings className="w-4 h-4" />, onClick: () => router.push("/settings") },
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
    );
}
