"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types/users";

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: UserRole | null;
    isLoading: boolean;
    login: (role: UserRole) => void;
    logout: () => void;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);

    // Use useEffect to initialize from localStorage after component mounts
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedAuth = localStorage.getItem("isAuthenticated") === "true";
            const storedRole = localStorage.getItem("userRole") as UserRole | null;

            setIsAuthenticated(storedAuth);
            setUserRole(storedRole);
        }
        setIsLoading(false); // Set loading to false after initialization
    }, []);

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
        <AuthContext.Provider value={{ isAuthenticated, userRole, isLoading, login, logout }}>
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