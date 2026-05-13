"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "mix" | "dark";

const STORAGE_KEY = "mp-theme";
const DEFAULT_THEME: Theme = "mix";

function applyTheme(theme: Theme) {
    if (theme === "light") {
        document.documentElement.removeAttribute("data-theme");
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }
}

function getStoredTheme(): Theme {
    if (typeof window === "undefined") return DEFAULT_THEME;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "mix" || stored === "dark"
        ? stored
        : DEFAULT_THEME;
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(getStoredTheme);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    function setTheme(next: Theme) {
        localStorage.setItem(STORAGE_KEY, next);
        setThemeState(next);
    }

    return { theme, setTheme };
}
