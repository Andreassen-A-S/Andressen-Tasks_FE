"use client";

import { useEffect, useMemo, useState } from "react";
import type { CreateProjectInput, Project } from "@/types/project";
import TextInput from "@/components/common/forms/TextInput";
import TextArea from "@/components/common/forms/TextArea";
import ColorInput from "@/components/common/forms/ColorInput";
import Banner from "@/components/common/Banner";
import { formatMissingRequiredFields } from "@/helpers/formValidation";

interface ProjectFormProps {
    formId: string;
    onLoadingChange?: (loading: boolean) => void;
    initial?: Project;
    onSubmit: (input: CreateProjectInput) => Promise<void>;
}

export default function ProjectForm({ formId, onLoadingChange, initial, onSubmit }: ProjectFormProps) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [color, setColor] = useState(initial?.color ?? "#1B1D22");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMissingRequiredBanner, setShowMissingRequiredBanner] = useState(false);
    const missingRequiredFields = useMemo(() => (!name.trim() ? ["navn"] : []), [name]);
    const missingRequiredText = useMemo(() => formatMissingRequiredFields(missingRequiredFields), [missingRequiredFields]);

    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setShowMissingRequiredBanner(true);
            setError(null);
            return;
        }
        setShowMissingRequiredBanner(false);
        setLoading(true);
        setError(null);
        try {
            await onSubmit({ name: name.trim(), description: description.trim() || undefined, color });
        } catch {
            setError("Kunne ikke gemme projekt. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (missingRequiredFields.length === 0) setShowMissingRequiredBanner(false);
    }, [missingRequiredFields.length]);

    function handleInvalidCapture() {
        if (missingRequiredFields.length === 0) return;
        setShowMissingRequiredBanner(true);
        setError(null);
    }

    return (
        <form id={formId} onSubmit={handleSubmit} onInvalidCapture={handleInvalidCapture} className="flex flex-col gap-5">
            {showMissingRequiredBanner && missingRequiredFields.length > 0 && (
                <Banner variant="warning">
                    Tilføj {missingRequiredText} før projektet kan gemmes.
                </Banner>
            )}

            {error && (
                <Banner variant="warning">
                    {error}
                </Banner>
            )}

            <div>
                <label className="label-lg mb-2 block">Navn *</label>
                <TextInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Projektnavn"
                />
            </div>

            <div>
                <label className="label-lg mb-2 block">Beskrivelse</label>
                <TextArea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Valgfri beskrivelse"
                />
            </div>

            <div>
                <label className="label-lg mb-2 block">Farve</label>
                <ColorInput
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
            </div>
        </form>
    );
}
