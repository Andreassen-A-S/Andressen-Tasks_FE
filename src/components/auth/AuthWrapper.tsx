"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/sidebar/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, userRole } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated && pathname !== "/login") {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Show loading spinner during hydration
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-500" />
            </div>
        );
    }

    // Show login page without sidebar
    if (pathname === "/login") {
        return <>{children}</>;
    }

    // Show loading or redirect if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-500" />
            </div>
        );
    }

    // Regular users get simple view without sidebar
    if (userRole === "USER") {
        return (
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        );
    }

    // Admins get full app with sidebar
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-80">
                {children}
            </main>
        </div>
    );
}