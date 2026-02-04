"use client";

import { createContext, useContext, useState } from "react";
import { UserRole } from "@/types/users";

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: UserRole | null; // Changed from string | null
    login: (role: UserRole) => void;
    logout: () => void;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    // Initialize state directly from localStorage
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("isAuthenticated") === "true";
        }
        return false;
    });

    const [userRole, setUserRole] = useState<UserRole | null>(() => {
        if (typeof window !== 'undefined') {
            const storedRole = localStorage.getItem("userRole") as UserRole | null;
            return storedRole || null;
        }
        return null;
    });

    const login = (role: UserRole) => {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", role);
        setIsAuthenticated(true);
        setUserRole(role);
    };

    const logout = () => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userRole");
        setIsAuthenticated(false);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}