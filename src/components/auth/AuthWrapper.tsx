"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/users";
import Sidebar from "@/components/sidebar/Sidebar";
import FullPageLoadingState from "@/components/common/loading/FullPageLoadingState";
import useDelayedVisibility from "@/hooks/useDelayedVisibility";
import { useTopProgress } from "@/components/common/loading/TopProgressProvider";


export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, userRole } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const showDelayedLoader = useDelayedVisibility(isLoading || !isAuthenticated, 180);
    const topProgress = useTopProgress();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated && pathname !== "/login") {
            topProgress.start();
            router.push("/login");
            return;
        }

        if (isAuthenticated && userRole !== UserRole.ADMIN && pathname !== "/login") {
            topProgress.start();
            router.push("/login");
            return;
        }

        if (isAuthenticated && pathname === "/login") {
            topProgress.start();
            router.push("/");
            return;
        }
    }, [isAuthenticated, isLoading, pathname, router, topProgress, userRole]);

    // Always show login page immediately
    if (pathname === "/login") {
        return <>{children}</>;
    }

    // Show loading spinner while checking authentication
    if (isLoading) {
        return showDelayedLoader ? <FullPageLoadingState /> : null;
    }

    // Not authenticated -> show loading while redirecting
    if (!isAuthenticated) {
        return showDelayedLoader ? <FullPageLoadingState /> : null;
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 ml-80">
                {children}
            </main>
        </div>
    );
}
