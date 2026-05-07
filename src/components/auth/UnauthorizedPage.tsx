"use client";

import { useRouter } from "next/navigation";
import { colors } from "@/constants/colors";
import Button from "@/components/common/buttons/Button";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
    const { logout } = useAuth();
    const router = useRouter();

    function handleGoToLogin() {
        logout();
        router.push("/login");
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4 max-w-sm px-6">
                <div className="flex justify-center">
                    <ShieldAlert className="w-16 h-16" style={{ color: colors.textSecondary }} />
                </div>
                <div className="space-y-1">
                    <p className="mono-xs" style={{ color: colors.textMuted }}>401</p>
                    <h1 className="h2" style={{ color: colors.textPrimary }}>Ingen adgang</h1>
                    <p className="body-sm" style={{ color: colors.textMuted }}>
                        Du har ikke adgang til denne side. Kontakt en administrator for hjælp.
                    </p>
                </div>
                <Button variant="secondary" size="md" onClick={handleGoToLogin}>
                    Gå til login
                </Button>
            </div>
        </div>
    );
}
