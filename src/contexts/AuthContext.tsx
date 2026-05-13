"use client";

import { createContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types/users";
import { verifyToken } from "@/lib/api";
import { login as apiLogin } from "@/lib/api";

export interface SavedAccount {
    token: string;
    user: User;
}

const SAVED_ACCOUNTS_KEY = "savedAccounts";

function loadSavedAccounts(): SavedAccount[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(SAVED_ACCOUNTS_KEY) ?? "[]");
    } catch {
        return [];
    }
}

function persistSavedAccounts(accounts: SavedAccount[]) {
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function getStoredOrgContext(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem("orgContext");
    } catch {
        return null;
    }
}

function upsertAccount(accounts: SavedAccount[], account: SavedAccount): SavedAccount[] {
    const idx = accounts.findIndex((a) => a.user.user_id === account.user.user_id);
    if (idx >= 0) {
        const updated = [...accounts];
        updated[idx] = account;
        return updated;
    }
    return [...accounts, account];
}

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: UserRole | null;
    user: User | null;
    isLoading: boolean;
    savedAccounts: SavedAccount[];
    contextOrgId: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    switchAccount: (account: SavedAccount) => void;
    setContextOrg: (orgId: string | null) => void;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
    const [contextOrgId] = useState<string | null>(getStoredOrgContext);

    useEffect(() => {
        const initializeAuth = async () => {
            if (typeof window === 'undefined') {
                setIsLoading(false);
                return;
            }

            const token = localStorage.getItem("authToken");
            setSavedAccounts(loadSavedAccounts());

            if (token) {
                try {
                    const response = await verifyToken(token);

                    if (response?.user?.user_id) {
                        setIsAuthenticated(true);
                        setUser(response.user);
                        setUserRole(response.user.role);
                    } else {
                        throw new Error("Invalid user data");
                    }
                } catch {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("userRole");
                    setIsAuthenticated(false);
                    setUser(null);
                    setUserRole(null);
                }
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);

            const response = await apiLogin({ email, password });

            if (!response.token) {
                throw new Error("Backend did not return a token.");
            }

            if (!response.user) {
                throw new Error("Backend did not return user data.");
            }

            localStorage.setItem("authToken", response.token);
            localStorage.setItem("userRole", response.user.role);

            const updated = upsertAccount(loadSavedAccounts(), { token: response.token, user: response.user });
            persistSavedAccounts(updated);
            setSavedAccounts(updated);

            setIsAuthenticated(true);
            setUser(response.user);
            setUserRole(response.user.role);
        } finally {
            setIsLoading(false);
        }
    };

    const setContextOrg = (orgId: string | null) => {
        if (orgId) localStorage.setItem("orgContext", orgId);
        else localStorage.removeItem("orgContext");
        window.location.href = "/";
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("orgContext");
        localStorage.removeItem(SAVED_ACCOUNTS_KEY);
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
        setSavedAccounts([]);
    };

    const switchAccount = (account: SavedAccount) => {
        localStorage.setItem("authToken", account.token);
        localStorage.setItem("userRole", account.user.role);
        localStorage.removeItem("orgContext");
        setIsAuthenticated(true);
        setUser(account.user);
        setUserRole(account.user.role);
        // Full reload ensures query cache, route state, and all server components reset cleanly
        window.location.href = "/";
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            userRole,
            user,
            isLoading,
            savedAccounts,
            contextOrgId,
            login,
            logout,
            switchAccount,
            setContextOrg,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
