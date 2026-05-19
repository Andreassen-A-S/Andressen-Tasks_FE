"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ImageUp, X } from "lucide-react";
import { toast } from "sonner";
import { getOrganization, updateOrganization, prepareOrgLogo } from "@/lib/api/organizations";
import { uploadToGcs } from "@/lib/api/attachments";
import type { User } from "@/types/users";
import type { Organization } from "@/types/organization";
import TextInput from "@/components/common/forms/TextInput";
import Button from "@/components/common/buttons/Button";
import LogoCropModal from "@/components/organizations/LogoCropModal";
import SettingsSection from "./SettingsSection";
import { useAuth } from "@/hooks/useAuth";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function revokeObjectUrl(url: string | null) {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

export default function OrgSettingsSection({ user }: { user: User }) {
    const { contextOrgId } = useAuth();
    const orgId = contextOrgId ?? user.organization_id;
    const { data: org, isLoading } = useQuery({
        queryKey: ["organization", orgId],
        queryFn: () => getOrganization(orgId!),
        enabled: !!orgId,
    });

    if (!orgId) return null;

    if (isLoading) {
        return (
            <SettingsSection title="Organisation" description="Rediger organisationens navn og logo.">
                <div className="h-24 rounded-lg bg-surface-subtle animate-pulse" />
            </SettingsSection>
        );
    }

    if (!org) return null;

    return <OrgForm key={org.org_id} org={org} />;
}

function OrgForm({ org }: { org: Organization }) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(org.name);
    const [logoUrl, setLogoUrl] = useState<string | null>(org.logo_url ?? null);
    const [logoPreview, setLogoPreview] = useState<string | null>(org.logo_url ?? null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [logoLoading, setLogoLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const cropSrcRef = useRef<string | null>(null);
    const logoPreviewRef = useRef<string | null>(null);

    // Track last-saved values so isDirty resets after save without waiting for re-fetch
    const [savedName, setSavedName] = useState(org.name);
    const [savedLogoUrl, setSavedLogoUrl] = useState<string | null>(org.logo_url ?? null);

    const isDirty = name !== savedName || logoUrl !== savedLogoUrl;

    useEffect(() => {
        cropSrcRef.current = cropSrc;
        logoPreviewRef.current = logoPreview;
    }, [cropSrc, logoPreview]);

    useEffect(() => () => {
        revokeObjectUrl(cropSrcRef.current);
        revokeObjectUrl(logoPreviewRef.current);
    }, []);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error("Kun JPEG, PNG og WebP er tilladt");
            return;
        }
        const nextCropSrc = URL.createObjectURL(file);
        setCropSrc((previous) => {
            revokeObjectUrl(previous);
            return nextCropSrc;
        });
    }

    async function handleCropConfirm(blob: Blob) {
        const preview = URL.createObjectURL(blob);
        setCropSrc((previous) => {
            revokeObjectUrl(previous);
            return null;
        });
        setLogoPreview((previous) => {
            revokeObjectUrl(previous);
            return preview;
        });
        setLogoLoading(true);
        try {
            const { uploadUrl, gcsPath } = await prepareOrgLogo(org.org_id, blob.type);
            await uploadToGcs(uploadUrl, new File([blob], "logo.webp", { type: blob.type }));
            setLogoUrl(gcsPath);
        } catch {
            toast.error("Logo-upload fejlede. Prøv igen.");
            setLogoPreview((previous) => {
                revokeObjectUrl(previous);
                return logoUrl;
            });
        } finally {
            setLogoLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const trimmedName = name.trim();
            await updateOrganization(org.org_id, {
                name: trimmedName,
                logo_url: logoUrl,
            });
            setName(trimmedName);
            setSavedName(trimmedName);
            setSavedLogoUrl(logoUrl);
            toast.success("Organisation opdateret");
            queryClient.invalidateQueries({ queryKey: ["organization", org.org_id] });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Kunne ikke opdatere organisation");
        } finally {
            setSaving(false);
        }
    }

    return (
        <SettingsSection
            title="Organisation"
            description="Rediger organisationens navn og logo. Ændringer er synlige for alle medarbejdere."
        >
            {/* Logo */}
            <div className="rounded-lg border border-border bg-surface px-4 py-4">
                <p className="label-lg mb-3">Logo</p>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl border border-border overflow-hidden flex items-center justify-center flex-shrink-0 bg-surface-subtle">
                        {logoPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-6 h-6 text-text-muted" />
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={<ImageUp className="w-4 h-4" />}
                            loading={logoLoading}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Skift logo
                        </Button>
                        {logoUrl && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                icon={<X className="w-4 h-4" />}
                                onClick={() => {
                                    setLogoUrl(null);
                                    setLogoPreview((previous) => {
                                        revokeObjectUrl(previous);
                                        return null;
                                    });
                                }}
                            >
                                Fjern logo
                            </Button>
                        )}
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Name */}
            <div className="rounded-lg border border-border bg-surface px-4 py-4">
                <label htmlFor="org-name" className="label-lg block mb-2">Navn</label>
                <TextInput
                    id="org-name"
                    name="org-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </div>

            {/* Save */}
            {isDirty && (
                <div className="flex justify-end">
                    <Button
                        variant="primary"
                        size="md"
                        loading={saving || logoLoading}
                        onClick={handleSave}
                    >
                        Gem ændringer
                    </Button>
                </div>
            )}

            {cropSrc && (
                <LogoCropModal
                    imageSrc={cropSrc}
                    onConfirm={handleCropConfirm}
                    onClose={() => setCropSrc((previous) => {
                        revokeObjectUrl(previous);
                        return null;
                    })}
                />
            )}
        </SettingsSection>
    );
}
