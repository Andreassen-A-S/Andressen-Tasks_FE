"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/constants/colors";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/common/buttons/Button";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) return;

        try {
            setIsLoading(true);
            setError(null);
            await login(email, password);
            // AuthWrapper handles redirect based on role
        } catch {
            setError("Forkert email eller adgangskode. Prøv igen.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: colors.eggWhite }}>
            <div className="w-full max-w-sm">
                {/* Logo & branding */}
                <div className="flex flex-col items-center mb-8">
                    <Image
                        src="/logo.png"
                        alt="MesterPlan"
                        width={180}
                        height={121}
                        className="mb-4"
                    />
                    <h1 className="h2" style={{ color: colors.textPrimary }}>MesterPlan</h1>
                    <p className="body-sm mt-1">Log ind for at fortsætte</p>
                </div>

                {/* Card */}
                <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="label-lg block mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="navn@andreassen.dk"
                                className="w-full px-3.5 py-2.5 rounded-lg border border-border body-md bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder-text-muted"
                                style={{ color: colors.textSecondary }}

                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="label-lg block mb-1.5">
                                Adgangskode
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-border body-md bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition placeholder-text-muted"
                                    style={{ color: colors.textSecondary }}

                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition"
                                    aria-label={showPassword ? "Skjul adgangskode" : "Vis adgangskode"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}


                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-lg bg-danger-surface border border-danger-border px-4 py-3">
                                <p className="body-sm text-danger">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={isLoading}
                            disabled={!email || !password || isLoading}
                        >
                            Log ind
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
