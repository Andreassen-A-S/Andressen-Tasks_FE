"use client";

import { colors } from "@/constants/colors";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, Suspense, ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface TopProgressContextValue {
    start: () => void;
    done: () => void;
}

const TopProgressContext = createContext<TopProgressContextValue | null>(null);

const START_SCALE = 0.125;
const MIN_VISIBLE_MS = 260;
const HOLD_BEFORE_CRAWL_MS = 140;
const MAX_LOADING_SCALE = 0.82;
const CRAWL_BASE_SPEED_PER_MS = 0.000022;
const CRAWL_PULSE_AMPLITUDE = 0.000055;
const CRAWL_PULSE_MIN_MS = 320;
const CRAWL_PULSE_MAX_MS = 700;
const CRAWL_MICRO_AMPLITUDE = 0.00001;
const CRAWL_MICRO_MIN_MS = 70;
const CRAWL_MICRO_MAX_MS = 160;
const CRAWL_TEXTURE_AMPLITUDE = 0.000004;
const CRAWL_TEXTURE_MIN_MS = 28;
const CRAWL_TEXTURE_MAX_MS = 64;
const COMPLETE_HOLD_MS = 80;
const COMPLETE_ANIMATION_MS = 360;

function TopProgressBar({ visible, scale }: { visible: boolean; scale: number }) {
    return (
        <div className={`pointer-events-none fixed inset-x-0 top-0 z-[9999] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
            <div
                className="h-1 origin-left ease-out"
                style={{
                    backgroundColor: colors.green,
                    transform: `scaleX(${scale})`,
                    transitionProperty: "transform",
                    transitionDuration: scale >= 1 ? `${COMPLETE_ANIMATION_MS}ms` : "75ms",
                }}
            />
        </div>
    );
}

function RouteWatcher({ finish }: { finish: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    useEffect(() => {
        const id = window.setTimeout(() => finish(), 0);
        return () => window.clearTimeout(id);
    }, [pathname, searchParams, finish]);
    return null;
}

export function TopProgressProvider({ children }: { children: ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [scale, setScale] = useState(0);
    const pendingCountRef = useRef(0);
    const visibleRef = useRef(false);
    const shownAtRef = useRef<number | null>(null);
    const startTimeoutRef = useRef<number | null>(null);
    const finishTimeoutRef = useRef<number | null>(null);
    const holdTimeoutRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const progressRef = useRef(0);
    const lastFrameAtRef = useRef<number | null>(null);
    const pulseStartedAtRef = useRef<number | null>(null);
    const pulseDurationRef = useRef<number>(0);
    const microPulseStartedAtRef = useRef<number | null>(null);
    const microPulseDurationRef = useRef<number>(0);
    const texturePulseStartedAtRef = useRef<number | null>(null);
    const texturePulseDurationRef = useRef<number>(0);

    const clearTimers = useCallback(() => {
        if (startTimeoutRef.current != null) {
            window.clearTimeout(startTimeoutRef.current);
            startTimeoutRef.current = null;
        }
        if (finishTimeoutRef.current != null) {
            window.clearTimeout(finishTimeoutRef.current);
            finishTimeoutRef.current = null;
        }
        if (holdTimeoutRef.current != null) {
            window.clearTimeout(holdTimeoutRef.current);
            holdTimeoutRef.current = null;
        }
        if (animationFrameRef.current != null) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    const resetBar = useCallback(() => {
        shownAtRef.current = null;
        progressRef.current = 0;
        lastFrameAtRef.current = null;
        pulseStartedAtRef.current = null;
        pulseDurationRef.current = 0;
        microPulseStartedAtRef.current = null;
        microPulseDurationRef.current = 0;
        texturePulseStartedAtRef.current = null;
        texturePulseDurationRef.current = 0;
        setScale(0);
    }, []);

    const startCrawl = useCallback(() => {
        if (animationFrameRef.current != null) return;

        pulseStartedAtRef.current = null;
        pulseDurationRef.current = 0;
        microPulseStartedAtRef.current = null;
        microPulseDurationRef.current = 0;
        texturePulseStartedAtRef.current = null;
        texturePulseDurationRef.current = 0;

        const tick = (timestamp: number) => {
            if (!visibleRef.current || pendingCountRef.current <= 0) {
                animationFrameRef.current = null;
                lastFrameAtRef.current = null;
                pulseStartedAtRef.current = null;
                microPulseStartedAtRef.current = null;
                texturePulseStartedAtRef.current = null;
                return;
            }

            if (pulseStartedAtRef.current == null) {
                pulseStartedAtRef.current = timestamp;
                pulseDurationRef.current = CRAWL_PULSE_MIN_MS + Math.random() * (CRAWL_PULSE_MAX_MS - CRAWL_PULSE_MIN_MS);
            }

            if (microPulseStartedAtRef.current == null) {
                microPulseStartedAtRef.current = timestamp;
                microPulseDurationRef.current = CRAWL_MICRO_MIN_MS + Math.random() * (CRAWL_MICRO_MAX_MS - CRAWL_MICRO_MIN_MS);
            }

            if (texturePulseStartedAtRef.current == null) {
                texturePulseStartedAtRef.current = timestamp;
                texturePulseDurationRef.current = CRAWL_TEXTURE_MIN_MS + Math.random() * (CRAWL_TEXTURE_MAX_MS - CRAWL_TEXTURE_MIN_MS);
            }

            const lastTimestamp = lastFrameAtRef.current ?? timestamp;
            const elapsed = timestamp - lastTimestamp;
            lastFrameAtRef.current = timestamp;

            const pulseElapsed = timestamp - pulseStartedAtRef.current;
            const pulseProgress = Math.min(1, pulseElapsed / pulseDurationRef.current);
            const pulseFactor = Math.max(0, Math.sin(pulseProgress * Math.PI * 2));

            const microElapsed = timestamp - microPulseStartedAtRef.current;
            const microProgress = Math.min(1, microElapsed / microPulseDurationRef.current);
            const microFactor = 0.5 + 0.5 * Math.sin(microProgress * Math.PI * 2);

            const textureElapsed = timestamp - texturePulseStartedAtRef.current;
            const textureProgress = Math.min(1, textureElapsed / texturePulseDurationRef.current);
            const textureFactor = 0.5 + 0.5 * Math.sin(textureProgress * Math.PI * 2);

            const currentSpeed =
                CRAWL_BASE_SPEED_PER_MS +
                CRAWL_PULSE_AMPLITUDE * pulseFactor +
                CRAWL_MICRO_AMPLITUDE * microFactor +
                CRAWL_TEXTURE_AMPLITUDE * textureFactor;

            progressRef.current = Math.min(
                MAX_LOADING_SCALE,
                progressRef.current + elapsed * currentSpeed,
            );
            setScale(progressRef.current);

            if (pulseProgress >= 1) {
                pulseStartedAtRef.current = timestamp;
                pulseDurationRef.current = CRAWL_PULSE_MIN_MS + Math.random() * (CRAWL_PULSE_MAX_MS - CRAWL_PULSE_MIN_MS);
            }

            if (microProgress >= 1) {
                microPulseStartedAtRef.current = timestamp;
                microPulseDurationRef.current = CRAWL_MICRO_MIN_MS + Math.random() * (CRAWL_MICRO_MAX_MS - CRAWL_MICRO_MIN_MS);
            }

            if (textureProgress >= 1) {
                texturePulseStartedAtRef.current = timestamp;
                texturePulseDurationRef.current = CRAWL_TEXTURE_MIN_MS + Math.random() * (CRAWL_TEXTURE_MAX_MS - CRAWL_TEXTURE_MIN_MS);
            }

            animationFrameRef.current = window.requestAnimationFrame(tick);
        };

        animationFrameRef.current = window.requestAnimationFrame(tick);
    }, []);

    const start = useCallback(() => {
        pendingCountRef.current += 1;
        clearTimers();

        if (visibleRef.current) {
            return;
        }

        visibleRef.current = true;
        shownAtRef.current = Date.now();
        setVisible(true);
        setScale(0);
        progressRef.current = START_SCALE;

        startTimeoutRef.current = window.setTimeout(() => {
            setScale(START_SCALE);
            holdTimeoutRef.current = window.setTimeout(() => {
                startCrawl();
            }, HOLD_BEFORE_CRAWL_MS);
        }, 0);
    }, [clearTimers, startCrawl]);

    const finish = useCallback(() => {
        clearTimers();

        if (!visibleRef.current) {
            return;
        }

        const elapsed = shownAtRef.current ? Date.now() - shownAtRef.current : MIN_VISIBLE_MS;
        const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

        finishTimeoutRef.current = window.setTimeout(() => {
            finishTimeoutRef.current = window.setTimeout(() => {
                setScale(1);
                visibleRef.current = false;
                setVisible(false);
                finishTimeoutRef.current = window.setTimeout(() => {
                    resetBar();
                }, COMPLETE_ANIMATION_MS);
            }, COMPLETE_HOLD_MS);
        }, remaining);
    }, [clearTimers, resetBar]);

    const done = useCallback(() => {
        pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);

        if (pendingCountRef.current > 0) {
            return;
        }

        finish();
    }, [finish]);

    useEffect(() => () => clearTimers(), [clearTimers]);

    const value = useMemo(() => ({ start, done }), [start, done]);

    return (
        <TopProgressContext.Provider value={value}>
            <Suspense>
                <RouteWatcher finish={finish} />
            </Suspense>
            <TopProgressBar visible={visible} scale={scale} />
            {children}
        </TopProgressContext.Provider>
    );
}

export function useTopProgress() {
    const context = useContext(TopProgressContext);

    if (!context) {
        throw new Error("useTopProgress must be used within TopProgressProvider");
    }

    return context;
}
