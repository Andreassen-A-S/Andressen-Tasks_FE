"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { createUser } from "@/lib/api/users";
import { User, UserRole } from "@/types/users";

interface CreateEmployeeFormProps {
    onCancel: () => void;
    onSuccess: (user: User) => void;
}

// TODO: Move to database table in the future
const PREDEFINED_POSITIONS = [
    "Håndmand",
    "HR",
    "Revisor",
    "Maskinfører",
    "Lagerarbejder",
];

export default function CreateEmployeeForm({ onCancel, onSuccess }: CreateEmployeeFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: UserRole.USER,
        position: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Local state for custom positions
    const [customPositions, setCustomPositions] = useState<string[]>([]);
    const [showCustomPositionInput, setShowCustomPositionInput] = useState(false);
    const [newPosition, setNewPosition] = useState("");

    // Show/hide password state
    const [showPassword, setShowPassword] = useState(false);

    const allPositions = [...PREDEFINED_POSITIONS, ...customPositions];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCustomPosition = () => {
        if (newPosition.trim() && !allPositions.includes(newPosition.trim())) {
            setCustomPositions(prev => [...prev, newPosition.trim()]);
            setFormData(prev => ({ ...prev, position: newPosition.trim() }));
            setNewPosition("");
            setShowCustomPositionInput(false);
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const user = await createUser(formData);
            onSuccess(user);
        } catch (err) {
            setError("Kunne ikke oprette medarbejder. Prøv igen.");
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
                        type="text"
                        id="name"
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
                    <label htmlFor="password" className="label-md">Adgangskode</label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleChange}
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
                        value={formData.role}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                    >
                        <option value={UserRole.USER}>Bruger</option>
                        <option value={UserRole.ADMIN}>Administrator</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="position" className="label-md">Stilling</label>
                    {!showCustomPositionInput ? (
                        <div className="space-y-2">
                            <select
                                id="position"
                                value={formData.position}
                                onChange={handleChange}
                                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                            >
                                <option value="">Vælg stilling...</option>
                                {allPositions.map(pos => (
                                    <option key={pos} value={pos}>{pos}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowCustomPositionInput(true)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                + Tilføj ny stilling
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newPosition}
                                    onChange={(e) => setNewPosition(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCustomPosition();
                                        }
                                    }}
                                    placeholder="Indtast ny stilling..."
                                    className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCustomPosition}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Tilføj
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCustomPositionInput(false);
                                        setNewPosition("");
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Annuller
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 bg-white flex flex-col-reverse sm:flex-row-reverse gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-[#0f6e56] px-5 py-3 btn-lg text-white
                        hover:bg-[#0a5551] transition-colors
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D9F6F]/30 focus-visible:ring-offset-2
                        disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Opretter...</span>
                        </>
                    ) : (
                        <span>Opret medarbejder</span>
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