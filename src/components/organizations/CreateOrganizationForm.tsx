"use client";

import { useEffect, useState } from "react";
import { createOrganization } from "@/lib/api/organizations";
import { toast } from "sonner";
import { colors } from "@/constants/colors";
import TextInput from "@/components/common/forms/TextInput";

interface CreateOrganizationFormProps {
    formId: string;
    onSuccess: () => void;
    onLoadingChange?: (loading: boolean) => void;
}

function toSlug(value: string) {
    return value
        .toLowerCase()
        .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default function CreateOrganizationForm({ formId, onSuccess, onLoadingChange }: CreateOrganizationFormProps) {
    const [formData, setFormData] = useState({ name: "", slug: "" });
    const [slugEdited, setSlugEdited] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const name = e.target.value;
        setFormData(prev => ({
            name,
            slug: slugEdited ? prev.slug : toSlug(name),
        }));
    }

    function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSlugEdited(true);
        setFormData(prev => ({ ...prev, slug: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await createOrganization({ name: formData.name.trim(), slug: formData.slug.trim() });
            toast.success("Organisation oprettet");
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Kunne ikke oprette organisation. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    return (
        <form id={formId} onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6">
            {error && (
                <div className="p-4 border-l-4 rounded-r-lg" style={{ backgroundColor: colors.redLight, borderLeftColor: colors.red }}>
                    <p className="body-sm" style={{ color: colors.red }}>{error}</p>
                </div>
            )}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="org-name" className="label-md block">Navn</label>
                    <TextInput
                        id="org-name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleNameChange}
                        placeholder="Andreassen A/S"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="org-slug" className="label-md block">Slug</label>
                    <TextInput
                        id="org-slug"
                        name="slug"
                        type="text"
                        required
                        value={formData.slug}
                        onChange={handleSlugChange}
                        placeholder="andreassen"
                    />
                    <p className="body-sm" style={{ color: colors.textMuted }}>URL-venligt id — kun små bogstaver, tal og bindestreg.</p>
                </div>
            </div>
        </form>
    );
}
