"use client";

import { createContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types/users";
import { verifyToken } from "@/lib/api";
import { login as apiLogin } from "@/lib/api";

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: UserRole | null;
    user: User | null;
    isLoading: boolean;
    login: (role: UserRole) => Promise<void>;
    logout: () => void;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

const TEST_CREDENTIALS = {
    ADMIN: {
        email: "rasm@mail.com",
        password: "123"
    },
    USER: {
        email: "viktor@mail.com",
        password: "123"
    }
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const initializeAuth = async () => {
            if (typeof window === 'undefined') {
                setIsLoading(false);
                return;
            }

            const token = localStorage.getItem("authToken");

            if (token) {
                try {
                    console.log("Verifying token...");
                    const response = await verifyToken(token);
                    console.log("Token verification response:", response);

                    // Ensure we have user data before setting state
                    if (response?.user?.user_id) {
                        setIsAuthenticated(true);
                        setUser(response.user);
                        setUserRole(response.user.role);
                        console.log("Auth state set successfully:", {
                            userId: response.user.user_id,
                            role: response.user.role
                        });
                    } else {
                        console.error("Invalid user data in token response:", response);
                        throw new Error("Invalid user data");
                    }
                } catch (error) {
                    console.error("Token verification failed:", error);
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("userRole");
                    setIsAuthenticated(false);
                    setUser(null);
                    setUserRole(null);
                }
            } else {
                console.log("No token found in localStorage");
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (role: UserRole) => {
        try {
            setIsLoading(true);

            const credentials = TEST_CREDENTIALS[role];
            const response = await apiLogin(credentials);

            if (!response.token) {
                console.error("Backend did not return a token.", response);
                throw new Error("Backend did not return a token.");
            }

            if (!response.user) {
                console.error("Backend did not return user data.", response);
                throw new Error("Backend did not return user data.");
            }

            localStorage.setItem("authToken", response.token);
            localStorage.setItem("userRole", role);

            setIsAuthenticated(true);
            setUser(response.user);
            setUserRole(role);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            userRole,
            user,
            isLoading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}