"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/users";
import Sidebar from "@/components/sidebar/Sidebar";
import FullPageLoadingState from "@/components/common/loading/FullPageLoadingState";
import useDelayedVisibility from "@/hooks/useDelayedVisibility";
import { useTopProgress } from "@/components/common/loading/TopProgressProvider";

const PUBLIC_ROUTES = ["/login", "/unauthorized", "/dashboard"];

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, userRole } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const showDelayedLoader = useDelayedVisibility(isLoading || !isAuthenticated, 180);
    const topProgress = useTopProgress();

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated && !isPublicRoute) {
            topProgress.start();
            router.push("/login");
            return;
        }

        if (isAuthenticated && userRole !== UserRole.ADMIN && pathname !== "/unauthorized") {
            topProgress.start();
            router.push("/unauthorized");
            return;
        }

        if (isAuthenticated && userRole === UserRole.ADMIN && (pathname === "/login" || pathname === "/unauthorized")) {
            topProgress.start();
            router.push("/");
            return;
        }
    }, [isAuthenticated, isLoading, isPublicRoute, pathname, router, topProgress, userRole]);

    if (isPublicRoute) {
        return <>{children}</>;
    }

    if (isLoading) {
        return showDelayedLoader ? <FullPageLoadingState /> : null;
    }

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
