"use client";

import { useEffect, useState } from "react";
import { createUser } from "@/lib/api/users";
import { User, UserRole } from "@/types/users";
import { toast } from "sonner";
import Button from "@/components/common/buttons/Button";
import { colors } from "@/constants/colors";
import TextInput from "@/components/common/forms/TextInput";
import SelectField from "@/components/common/forms/SelectField";
import { UserPositions } from "@/types/users";

interface CreateEmployeeFormProps {
    formId: string;
    onSuccess: (user: User) => void;
    onLoadingChange?: (loading: boolean) => void;
}

export default function CreateEmployeeForm({ formId, onSuccess, onLoadingChange }: CreateEmployeeFormProps) {
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

    const allPositions = [...UserPositions, ...customPositions];
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
            toast.success("Medarbejder oprettet");
            onSuccess(user);
        } catch {
            setError("Kunne ikke oprette medarbejder. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    return (
        <form id={formId} onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6">
            <div className="space-y-1">
                <p className="body-sm" style={{ color: colors.textSecondary }}>
                    Opret en ny medarbejder, vælg rolle, og tilføj en stilling til planlægning og tildeling.
                </p>
            </div>

            {error && (
                <div
                    className="p-4 border-l-4 rounded-r-lg"
                    style={{ backgroundColor: colors.redLight, borderLeftColor: colors.red }}
                >
                    <p className="body-sm" style={{ color: colors.red }}>{error}</p>
                </div>
            )}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="name" className="label-md block">Navn</label>
                    <TextInput
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="label-md block">Email</label>
                    <TextInput
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="password" className="label-md block">Adgangskode</label>
                    <TextInput
                        id="password"
                        name="password"
                        type="password"
                        sensitive
                        required
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="role" className="label-md block">Rolle</label>
                    <SelectField
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value={UserRole.USER}>Bruger</option>
                        <option value={UserRole.ADMIN}>Administrator</option>
                    </SelectField>
                </div>
                <div className="space-y-2">
                    <label htmlFor="position" className="label-md block">Stilling</label>
                    {!showCustomPositionInput ? (
                        <div className="space-y-2">
                            <SelectField
                                id="position"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                            >
                                <option value="">Vælg stilling...</option>
                                {allPositions.map(pos => (
                                    <option key={pos} value={pos}>{pos}</option>
                                ))}
                            </SelectField>
                            <button
                                type="button"
                                onClick={() => setShowCustomPositionInput(true)}
                                className="link"
                            >
                                + Tilføj ny stilling
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <TextInput
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
                                    className="flex-1"
                                    autoFocus
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddCustomPosition}
                                    variant="primary"
                                    size="md"
                                >
                                    Tilføj
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setShowCustomPositionInput(false);
                                        setNewPosition("");
                                    }}
                                    variant="secondary"
                                    size="md"
                                >
                                    Annuller
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
