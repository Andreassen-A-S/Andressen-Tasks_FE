"use client";

import { createContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types/users";
import { login as apiLogin, refreshSession, switchAccount as apiSwitchAccount } from "@/lib/api";
import { setAuthToken } from "@/helpers/helpers";
import { registerUnauthorizedHandler } from "@/lib/api/apiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SavedAccount {
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
    try {
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
        // Account switching is best-effort; a storage failure should not fail login.
    }
}

function getStoredOrgContext(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem("orgContext");
    } catch {
        return null;
    }
}

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: UserRole | null;
    user: User | null;
    isLoading: boolean;
    savedAccounts: SavedAccount[];
    contextOrgId: string | null;
    login: (email: string, password: string) => Promise<void>;
    addAccount: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    switchAccount: (account: SavedAccount) => Promise<void>;
    setContextOrg: (orgId: string | null) => void;
    updateCurrentUser: (updates: Partial<User>) => void;
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
    const [contextOrgId, setContextOrgId] = useState<string | null>(getStoredOrgContext);

    useEffect(() => {
        registerUnauthorizedHandler(() => {
            setAuthToken(null);
            setIsAuthenticated(false);
            setUser(null);
            setUserRole(null);
            window.location.href = "/login";
        });

        const initializeAuth = async () => {
            if (typeof window === "undefined") {
                setIsLoading(false);
                return;
            }

            // Show stale account summaries instantly while waiting for server
            setSavedAccounts(loadSavedAccounts());

            try {
                const response = await refreshSession();
                setAuthToken(response.token);
                setIsAuthenticated(true);
                setUser(response.user);
                setUserRole(response.user.role);
                // Server is authoritative for which accounts are in this session
                const accounts = response.savedAccounts.map((u) => ({ user: u }));
                persistSavedAccounts(accounts);
                setSavedAccounts(accounts);
            } catch {
                setAuthToken(null);
                setIsAuthenticated(false);
                setUser(null);
                setUserRole(null);
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiLogin({ email, password });

        if (!response.token) throw new Error("Backend did not return a token.");
        if (!response.user) throw new Error("Backend did not return user data.");

        setAuthToken(response.token);
        localStorage.removeItem("orgContext");
        setContextOrgId(null);

        const accounts = response.savedAccounts.map((u) => ({ user: u }));
        persistSavedAccounts(accounts);
        setSavedAccounts(accounts);

        setIsAuthenticated(true);
        setUser(response.user);
        setUserRole(response.user.role);
    };

    const addAccount = async (email: string, password: string) => {
        const response = await apiLogin({ email, password });

        if (!response.token) throw new Error("Backend did not return a token.");
        if (!response.user) throw new Error("Backend did not return user data.");

        const accounts = response.savedAccounts.map((u) => ({ user: u }));
        persistSavedAccounts(accounts);
        setSavedAccounts(accounts);

        setAuthToken(response.token);
        localStorage.removeItem("orgContext");
        window.location.href = "/";
    };

    const setContextOrg = (orgId: string | null) => {
        if (orgId) localStorage.setItem("orgContext", orgId);
        else localStorage.removeItem("orgContext");
        setContextOrgId(orgId);
    };

    const logout = async () => {
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        }).catch(() => {});
        setAuthToken(null);
        localStorage.removeItem("orgContext");
        localStorage.removeItem(SAVED_ACCOUNTS_KEY);
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
        setSavedAccounts([]);
        setContextOrgId(null);
    };

    const updateCurrentUser = (updates: Partial<User>) => {
        let updated: User | null = null;
        setUser((prev) => {
            if (!prev) return prev;
            updated = { ...prev, ...updates };
            return updated;
        });
        if (!updated) return;
        const accounts = loadSavedAccounts();
        const idx = accounts.findIndex((a) => a.user.user_id === (updated as User).user_id);
        if (idx < 0) return;
        const upserted = [...accounts];
        upserted[idx] = { user: updated };
        persistSavedAccounts(upserted);
        setSavedAccounts(upserted);
    };

    const switchAccount = async (account: SavedAccount) => {
        const result = await apiSwitchAccount(account.user.user_id);
        // Server returns updated savedAccounts with all session accounts
        const accounts = result.savedAccounts.map((u) => ({ user: u }));
        persistSavedAccounts(accounts);
        setSavedAccounts(accounts);

        setAuthToken(result.token);
        localStorage.removeItem("orgContext");
        setContextOrgId(null);
        setIsAuthenticated(true);
        setUser(result.user);
        setUserRole(result.user.role);
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
            addAccount,
            logout,
            switchAccount,
            setContextOrg,
            updateCurrentUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
