"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/sidebar/Sidebar";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Only redirect after loading is complete
        if (!isLoading && !isAuthenticated && pathname !== "/login") {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Show loading spinner during hydration
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Indlæser...</p>
                </div>
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Omdirigerer til login...</p>
                </div>
            </div>
        );
    }

    // Show authenticated app with sidebar
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-80 bg-gray-50 min-h-screen flex-1">
                {children}
            </main>
        </div>
    );
}