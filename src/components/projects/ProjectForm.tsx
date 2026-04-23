"use client";

import { useEffect, useState } from "react";
import type { CreateProjectInput, Project } from "@/types/project";
import { colors } from "@/constants/colors";
import TextInput from "@/components/common/forms/TextInput";
import TextArea from "@/components/common/forms/TextArea";
import ColorInput from "@/components/common/forms/ColorInput";

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

    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setError("Navn er påkrævet");
            return;
        }
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

    return (
        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
                <div
                    className="rounded-md border px-4 py-3"
                    style={{
                        borderColor: colors.red,
                        backgroundColor: colors.redLight,
                    }}
                >
                    <p className="body-sm" style={{ color: colors.red }}>{error}</p>
                </div>
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
