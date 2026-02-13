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
        { href: "/tasks", label: "Opgaver", icon: <FontAwesomeIcon icon={faTasks} size="lg" /> },
        { href: "/templates", label: "Skabeloner", icon: <FontAwesomeIcon icon={faRepeat} size="lg" /> },
        { href: "/employees", label: "Medarbejdere", icon: <FontAwesomeIcon icon={faUsers} size="lg" /> },
        { href: "/statistics", label: "Statistik", icon: <FontAwesomeIcon icon={faChartColumn} size="lg" /> },
        { href: "/settings", label: "Indstillinger", icon: <FontAwesomeIcon icon={faGear} size="lg" /> },
    ];

    return (
        <aside className="w-80 bg-gray-800 border-r h-screen flex flex-col fixed left-0 top-0">
            {/* Header - Fixed size */}
            <div className="p-6 border-b-2 border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Image src="/favicon.ico" alt="Andressen A/S" width={60} height={60} />
                    <h1 className="text-xl font-semibold text-white">Andressen TMS</h1>
                </div>
            </div>

            {/* Navigation - Takes remaining space with scrolling */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? "bg-green-900 text-green-500 font-medium"
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile - Always at bottom of screen */}
            <div className="p-4 border-t-2 border-gray-700 flex-shrink-0 mt-auto">
                <div className="flex items-center mb-4">
                    <SingleAvatar
                        name={user?.name || "Unknown User"}
                        size="md"
                        className="mr-3"
                    />
                    <div className="text-sm min-w-0 flex-1">
                        <p className="font-medium text-white truncate">
                            {user?.name || "Unknown User"}
                        </p>
                        <p className="text-gray-400 text-xs">
                            {userRole === "ADMIN" ? "Administrator" : "Bruger"}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Log ud</span>
                </button>
            </div>
        </aside>
    );
}