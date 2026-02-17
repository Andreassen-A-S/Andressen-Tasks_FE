"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { faChartColumn, faGear, faTasks, faUsers, faSignOutAlt, faRepeat } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/hooks/useAuth";
import SingleAvatar from "@/components/common/label/singleAvatar";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, userRole, logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const navItems = [
        { href: "/tasks", label: "Opgaver", icon: faTasks },
        { href: "/templates", label: "Gentagende opgaver", icon: faRepeat },
        { href: "/employees", label: "Medarbejdere", icon: faUsers },
        { href: "/statistics", label: "Statistik", icon: faChartColumn },
        { href: "/settings", label: "Indstillinger", icon: faGear },
    ];

    return (
        <aside className="w-75 bg-[#1B1D22] border-r border-[rgba(255,255,255,0.06)] h-screen flex flex-col fixed left-0 top-0">
            {/* Header - Brand */}
            <div className="p-6 border-b border-[rgba(255,255,255,0.06)] flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Image src="/favicon.ico" alt="Andressen A/S" width={80} height={34} />
                    <div>
                        <h1 className="sidebar-brand">Andressen A/S</h1>
                        <span className="sidebar-brand-sub">task management</span>
                    </div>
                </div>
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
                                    className={`flex items-center gap-3 px-4 py-2 rounded-[8px] transition-colors ${isActive
                                        ? "bg-[rgba(255,255,255,0.08)] nav-item-active"
                                        : "nav-item hover:bg-gray-700 hover:text-white"
                                        }`}
                                >
                                    <span className="flex items-center justify-center w-5 h-5">
                                        <FontAwesomeIcon icon={item.icon} className="w-3.5 h-3.5" />
                                    </span>
                                    <span className="truncate">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-[rgba(255,255,255,0.06)] shrink-0 mt-auto">
                <div className="flex items-center mb-4">
                    <SingleAvatar
                        name={user?.name || "Unknown User"}
                        size="md"
                        className="mr-3 rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="nav-item-active  text-white truncate">
                            {user?.name || "Unknown User"}
                        </p>
                        <p className="text-[#A8AABB] nav-item ">
                            {userRole === "ADMIN" ? "Administrator" : "Bruger"}
                        </p>

                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 nav-item text-[#A8AABB] hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Log ud</span>
                </button>
            </div>
        </aside>
    );
}