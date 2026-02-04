"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { faUser, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/users";

export default function LoginPage() {
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!selectedRole) return;

        setIsLoading(true);
        setError(null);

        try {
            await login(selectedRole);
            router.push("/tasks");
        } catch (err) {
            console.error("Login error:", err);
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const roleOptions = [
        {
            value: "USER" as UserRole,
            label: "Test Bruger",
            description: "Standard medarbejder adgang",
            icon: faUser,
            color: "bg-blue-500 hover:bg-blue-600",
        },
        {
            value: "ADMIN" as UserRole,
            label: "Test Administrator",
            description: "Fuld system adgang",
            icon: faUserShield,
            color: "bg-green-500 hover:bg-green-600",
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo and Header */}
                <div className="flex justify-center">
                    <Image
                        src="/favicon.ico"
                        alt="Andressen A/S"
                        width={80}
                        height={80}
                        className="rounded-lg"
                    />
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                    Andressen TMS
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Vælg din rolle for at logge ind
                </p>

                {/* Development Warning */}
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Udviklings Login
                            </h3>
                            <div className="mt-1 text-sm text-yellow-700">
                                Dette er en midlertidig login side. Ingen rigtig autentificering kræves.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* Role Selection */}
                    <div className="space-y-4">
                        <label className="text-base font-medium text-gray-900">
                            Vælg din rolle:
                        </label>
                        <div className="space-y-3">
                            {roleOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`
                                        relative rounded-lg border cursor-pointer p-4 focus:outline-none transition-all
                                        ${selectedRole === option.value
                                            ? 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }
                                    `}
                                    onClick={() => setSelectedRole(option.value)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white ${option.color}`}>
                                                <FontAwesomeIcon icon={option.icon} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {option.label}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {option.description}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedRole === option.value
                                            ? 'border-indigo-600 bg-indigo-600'
                                            : 'border-gray-300'
                                            }`}>
                                            {selectedRole === option.value && (
                                                <div className="h-2 w-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Login Button */}
                    <div className="mt-8">
                        <button
                            onClick={handleLogin}
                            disabled={!selectedRole || isLoading}
                            className={`
                                w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                                transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                ${!selectedRole || isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                }
                            `}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Logger ind...
                                </div>
                            ) : (
                                `Log ind som ${selectedRole === "ADMIN" ? "Administrator" : "Bruger"}`
                            )}
                        </button>
                    </div>

                    {/* Demo Accounts Info */}
                    <div className="mt-6 bg-gray-50 rounded-md p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Demo konti:</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>Bruger:</strong> Standard opgave visning</div>
                            <div><strong>Administrator:</strong> Fuld system adgang</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}