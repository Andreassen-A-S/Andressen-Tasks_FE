"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { updateUser } from "@/lib/api/users";
import { UpdateUserInput, User } from "@/types/users";

interface UpdateEmployeeFormProps {
    user: User;
    onCancel: () => void;
    onSuccess: (user: User) => void;
}

export default function UpdateEmployeeForm({ user, onCancel, onSuccess }: UpdateEmployeeFormProps) {
    const [formData, setFormData] = useState({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "USER",
        position: user.position || "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Show/hide password state
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Only send password if it's filled in
            const updates: UpdateUserInput = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                position: formData.position,
            };
            if (formData.password) {
                updates.password = formData.password;
            }
            const updatedUser = await updateUser(user.user_id, updates);
            onSuccess(updatedUser);
        } catch {
            setError("Kunne ikke opdatere medarbejder. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="label-md">Navn</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="label-md">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="label-md">Ny adgangskode</label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Efterlad tom for at beholde nuværende"
                            className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors pr-12"
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            aria-label={showPassword ? "Skjul adgangskode" : "Vis adgangskode"}
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>
                </div>
                <div>
                    <label htmlFor="role" className="label-md">Rolle</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                    >
                        <option value="USER">Bruger</option>
                        <option value="ADMIN">Administrator</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="position" className="label-md">Stilling</label>
                    <input
                        id="position"
                        name="position"
                        type="text"
                        value={formData.position}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                    />
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 bg-white flex flex-col-reverse sm:flex-row-reverse gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all sm:w-auto"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Opdaterer...</span>
                        </>
                    ) : (
                        <span>Opdater medarbejder</span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all sm:w-auto"
                >
                    Annuller
                </button>
            </div>
        </form>
    );
}