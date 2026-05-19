"use client";

import { useEffect, useState } from "react";
import { updateUser } from "@/lib/api/users";
import { UpdateUserInput, User, UserPositions, UserStatus, isAdminRole } from "@/types/users";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { colors } from "@/constants/colors";
import TextInput from "@/components/common/forms/TextInput";
import SelectField from "@/components/common/forms/SelectField";

interface UpdateEmployeeFormProps {
    formId: string;
    user: User;
    onSuccess: (user: User) => void;
    onLoadingChange?: (loading: boolean) => void;
}

export default function UpdateEmployeeForm({ formId, user, onSuccess, onLoadingChange }: UpdateEmployeeFormProps) {
    const { userRole } = useAuth();
    const canEditStatus = isAdminRole(userRole);

    const [formData, setFormData] = useState({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "USER",
        position: user.position || "",
        status: user.status || UserStatus.ACTIVE,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                ...(canEditStatus ? { status: formData.status } : {}),
            };
            if (formData.password) {
                updates.password = formData.password;
            }
            const updatedUser = await updateUser(user.user_id, updates);
            toast.success("Medarbejder opdateret");
            onSuccess(updatedUser);
        } catch {
            setError("Kunne ikke opdatere medarbejder. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    return (
        <form id={formId} onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6">
            <p className="body-sm" style={{ color: colors.textSecondary }}>
                Opdater medarbejderens oplysninger, rolle og stilling.
            </p>

            {error && (
                <div
                    className="rounded-md border p-3"
                    style={{ backgroundColor: colors.redLight, borderColor: colors.redBorder }}
                >
                    <p className="body-sm" style={{ color: colors.red }}>{error}</p>
                </div>
            )}
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="label-md block mb-2">Navn</label>
                    <TextInput
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="email" className="label-md block mb-2">Email</label>
                    <TextInput
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <label htmlFor="password" className="label-md block">Ny adgangskode</label>
                    </div>
                    <TextInput
                        id="password"
                        name="password"
                        type="password"
                        sensitive
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Efterlad tom for at beholde nuværende"
                    />

                </div>
                <div>
                    <label htmlFor="role" className="label-md block mb-2">Rolle</label>
                    <SelectField
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="USER">Bruger</option>
                        <option value="ADMIN">Administrator</option>
                    </SelectField>
                </div>
                {canEditStatus && (
                    <div>
                        <label htmlFor="status" className="label-md block mb-2">Status</label>
                        <SelectField
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value={UserStatus.ACTIVE}>Aktiv</option>
                            <option value={UserStatus.TERMINATED}>Opsagt</option>
                        </SelectField>
                    </div>
                )}
                <div>
                    <label htmlFor="position" className="label-md block mb-2">Stilling</label>
                    <SelectField
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                    >
                        <option value="">Vælg stilling...</option>
                        {UserPositions.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                        ))}
                        {formData.position && !UserPositions.includes(formData.position) && (
                            <option value={formData.position}>{formData.position}</option>
                        )}
                    </SelectField>
                </div>
            </div>
        </form>
    );
}
