"use client";

import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faCalendar, faUser, } from "@fortawesome/free-regular-svg-icons";

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        {
            label: "Opgaver",
            icon: faCheckSquare,
            path: "/my-tasks",
            active: pathname === "/my-tasks" || pathname === "/"
        },
        {
            label: "Kalender",
            icon: faCalendar,
            path: "/calendar",
            active: pathname === "/calendar"
        },
        {
            label: "Profil",
            icon: faUser,
            path: "/profile",
            active: pathname === "/profile"
        }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E6E1] z-50 pb-5">
            <div className="max-w-[430px] mx-auto flex">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => router.push(item.path)}
                        className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${item.active ? "text-[#0f6e56]" : "text-[#9DA1B4]"
                            }`}
                    >
                        <FontAwesomeIcon icon={item.icon} size="lg" />
                        <span
                            className="text-[10px] font-medium tracking-wide"
                            style={{ fontFamily: "Outfit, sans-serif" }}
                        >
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </nav>
    );
}