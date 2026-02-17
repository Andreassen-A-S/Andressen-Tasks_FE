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
        // Wait for auth to complete
        if (isLoading) return;

        // Not authenticated -> go to login
        if (!isAuthenticated && pathname !== "/login") {
            router.push("/login");
            return;
        }

        // Authenticated -> route by role
        if (isAuthenticated && pathname === "/login") {
            if (userRole === "USER") {
                router.push("/my-tasks");
            } else if (userRole === "ADMIN") {
                router.push("/");
            }
            return;
        }

        // Prevent users from accessing admin routes
        if (userRole === "USER" && !pathname.startsWith("/my-tasks")) {
            router.push("/my-tasks");
        }

        // Prevent admins from accessing user-only routes
        if (userRole === "ADMIN" && pathname.startsWith("/my-tasks")) {
            router.push("/");
        }
    }, [isAuthenticated, isLoading, pathname, router, userRole]);

    // Always show login page immediately
    if (pathname === "/login") {
        return <>{children}</>;
    }

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div>
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-500" />
                </div>
            </div>
        );
    }

    // Not authenticated -> show loading while redirecting
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-500" />
            </div>
        );
    }

    // USER role gets simple layout
    if (userRole === "USER") {
        return (
            <div className="min-h-screen bg-background">
                {children}
            </div>
        );
    }

    // ADMIN role gets sidebar layout
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 ml-80">
                {children}
            </main>
        </div>
    );
}