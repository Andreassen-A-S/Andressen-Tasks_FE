"use client";

import { useEffect, useState } from "react";

export default function useDelayedVisibility(active: boolean, delayMs = 180) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!active) {
            const resetId = window.setTimeout(() => {
                setVisible(false);
            }, 0);

            return () => window.clearTimeout(resetId);
        }

        const timeoutId = window.setTimeout(() => {
            setVisible(true);
        }, delayMs);

        return () => window.clearTimeout(timeoutId);
    }, [active, delayMs]);

    return visible;
}
