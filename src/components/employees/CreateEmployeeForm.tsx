"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createUser } from "@/lib/api/users";
import { getOrganizations } from "@/lib/api/organizations";
import { getPositions } from "@/lib/api/positions";
import { User, UserRole } from "@/types/users";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { colors } from "@/constants/colors";
import TextInput from "@/components/common/forms/TextInput";
import SelectField from "@/components/common/forms/SelectField";

interface CreateEmployeeFormProps {
    formId: string;
    onSuccess: (user: User) => void;
    onLoadingChange?: (loading: boolean) => void;
}

export default function CreateEmployeeForm({ formId, onSuccess, onLoadingChange }: CreateEmployeeFormProps) {
    const { contextOrgId, userRole, user } = useAuth();
    const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
    const defaultOrgId = contextOrgId ?? user?.organization_id ?? "";

    const { data: organizations = [] } = useQuery({
        queryKey: ["organizations"],
        queryFn: getOrganizations,
        enabled: isSuperAdmin,
    });

    const { data: allPositions = [], isLoading: positionsLoading, isError: positionsError } = useQuery({
        queryKey: ["positions"],
        queryFn: getPositions,
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: UserRole.USER,
        position_id: "",
        organization_id: defaultOrgId,
    });

    // Superadmin sees all positions — filter to the selected org so only valid positions show.
    // Regular admins already get their own org's positions from the API.
    const positions = isSuperAdmin
        ? allPositions.filter(p => p.organization_id === formData.organization_id)
        : allPositions;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === "organization_id" ? { position_id: "" } : {}),
        }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = isSuperAdmin
                ? { ...formData, position_id: formData.position_id || undefined }
                : { name: formData.name, email: formData.email, password: formData.password, role: formData.role, position_id: formData.position_id || undefined };
            const created = await createUser(payload);
            toast.success("Medarbejder oprettet");
            onSuccess(created);
        } catch {
            setError("Kunne ikke oprette medarbejder. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    useEffect(() => {
        setFormData(prev => prev.organization_id === defaultOrgId ? prev : { ...prev, organization_id: defaultOrgId });
    }, [defaultOrgId]);

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
                {isSuperAdmin && (
                    <div className="space-y-2">
                        <label htmlFor="organization_id" className="label-md block">Organisation</label>
                        <SelectField
                            id="organization_id"
                            name="organization_id"
                            value={formData.organization_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Vælg organisation...</option>
                            {organizations.map(org => (
                                <option key={org.org_id} value={org.org_id}>{org.name}</option>
                            ))}
                        </SelectField>
                    </div>
                )}
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
                    <label htmlFor="position_id" className="label-md block">Stilling</label>
                    <SelectField
                        id="position_id"
                        name="position_id"
                        value={formData.position_id}
                        onChange={handleChange}
                        disabled={positionsLoading || positionsError}
                    >
                        <option value="">{positionsLoading ? "Indlæser stillinger..." : positionsError ? "Kunne ikke indlæse stillinger" : "Vælg stilling..."}</option>
                        {positions.map(pos => (
                            <option key={pos.position_id} value={pos.position_id}>{pos.name}</option>
                        ))}
                    </SelectField>
                </div>
            </div>
        </form>
    );
}
