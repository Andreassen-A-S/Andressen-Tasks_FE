"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isAdminRole, UserRole } from "@/types/users";
import Sidebar from "@/components/sidebar/Sidebar";
import FullPageLoadingState from "@/components/common/loading/FullPageLoadingState";
import useDelayedVisibility from "@/hooks/useDelayedVisibility";
import { useTopProgress } from "@/components/common/loading/TopProgressProvider";

const PUBLIC_ROUTES = ["/login", "/unauthorized"];
const PUBLIC_PREFIXES = ["/legal"];
const NO_SIDEBAR_ROUTES = ["/dashboard"];

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, userRole, contextOrgId, user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const showDelayedLoader = useDelayedVisibility(isLoading || !isAuthenticated, 180);
    const topProgress = useTopProgress();

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some(p => pathname.startsWith(p));

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated && !isPublicRoute) {
            topProgress.start();
            router.push("/login");
            return;
        }

        const isPrivileged = isAdminRole(userRole);

        if (isAuthenticated && !isPrivileged && pathname !== "/unauthorized") {
            topProgress.start();
            router.push("/unauthorized");
            return;
        }

        if (isAuthenticated && isPrivileged && pathname.startsWith("/organizations") && userRole !== UserRole.SUPER_ADMIN) {
            const ownOrgPath = user?.organization_id ? `/organizations/${user.organization_id}` : null;
            if (pathname !== ownOrgPath) {
                topProgress.start();
                router.push("/unauthorized");
                return;
            }
        }

        const platformOnlyRoutes = ["/tasks", "/projects", "/templates"];
        if (isAuthenticated && userRole === UserRole.SUPER_ADMIN && !contextOrgId && platformOnlyRoutes.some(r => pathname.startsWith(r))) {
            topProgress.start();
            router.push("/organizations");
            return;
        }

        if (isAuthenticated && isPrivileged && (pathname === "/login" || pathname === "/unauthorized")) {
            topProgress.start();
            router.push("/");
            return;
        }
    }, [isAuthenticated, isLoading, isPublicRoute, pathname, router, topProgress, userRole, contextOrgId, user?.organization_id]);

    if (isPublicRoute) {
        return <>{children}</>;
    }

    if (isLoading) {
        return showDelayedLoader ? <FullPageLoadingState /> : null;
    }

    if (!isAuthenticated) {
        return showDelayedLoader ? <FullPageLoadingState /> : null;
    }

    if (NO_SIDEBAR_ROUTES.includes(pathname)) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-background max-w-[1920px] mx-auto">
            <Sidebar />
            <main className="flex-1 ml-80">
                {children}
            </main>
        </div>
    );
}
