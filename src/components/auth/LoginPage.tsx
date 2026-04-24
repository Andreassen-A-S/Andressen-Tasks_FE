"use client";

import { useState } from "react";
import Image from "next/image";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/constants/colors";

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
                        alt="Andreassen A/S"
                        width={180}
                        height={56}
                        className="rounded-lg mb-4"
                    />
                    <h1 className="h2" style={{ color: colors.textPrimary }}>Andreassen TMS</h1>
                    <p className="body-sm mt-1">Log ind for at fortsætte</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
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
                                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 body-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0f6e56] focus:border-transparent transition placeholder-gray-300"
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
                                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 body-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0f6e56] focus:border-transparent transition placeholder-gray-300"
                                    style={{ color: colors.textSecondary }}

                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                    aria-label={showPassword ? "Skjul adgangskode" : "Vis adgangskode"}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
                                <p className="body-sm" style={{ color: colors.red }}>{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!email || !password || isLoading}
                            className="w-full py-2.5 rounded-lg text-white btn-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f6e56] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: colors.green }}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Logger ind...
                                </span>
                            ) : (
                                "Log ind"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
