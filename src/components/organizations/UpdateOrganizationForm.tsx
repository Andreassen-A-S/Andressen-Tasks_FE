"use client";

import { useEffect, useRef, useState } from "react";
import { updateOrganization, prepareOrgLogo } from "@/lib/api/organizations";
import { uploadToGcs } from "@/lib/api/attachments";
import type { Organization } from "@/types/organization";
import { toast } from "sonner";
import { colors } from "@/constants/colors";
import TextInput from "@/components/common/forms/TextInput";
import Button from "@/components/common/buttons/Button";
import LogoCropModal from "./LogoCropModal";
import { Building2, ImageUp, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/users";

interface UpdateOrganizationFormProps {
    formId: string;
    organization: Organization;
    onSuccess: () => void;
    onLoadingChange?: (loading: boolean) => void;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function revokeObjectUrl(url: string | null) {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

export default function UpdateOrganizationForm({ formId, organization, onSuccess, onLoadingChange }: UpdateOrganizationFormProps) {
    const { userRole } = useAuth();
    const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
    const [formData, setFormData] = useState({
        name: organization.name,
        slug: organization.slug,
    });
    const [logoUrl, setLogoUrl] = useState<string | null>(organization.logo_url ?? null);
    const [logoPreview, setLogoPreview] = useState<string | null>(organization.logo_url ?? null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [logoLoading, setLogoLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cropSrcRef = useRef<string | null>(null);
    const logoPreviewRef = useRef<string | null>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

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
            const { uploadUrl, gcsPath } = await prepareOrgLogo(organization.org_id, blob.type);
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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload: Parameters<typeof updateOrganization>[1] = {
                name: formData.name.trim(),
                ...(isSuperAdmin ? { slug: formData.slug.trim() } : {}),
            };
            if (logoUrl !== organization.logo_url) payload.logo_url = logoUrl;
            await updateOrganization(organization.org_id, payload);
            toast.success("Organisation opdateret");
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Kunne ikke opdatere organisation. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        onLoadingChange?.(loading || logoLoading);
    }, [loading, logoLoading, onLoadingChange]);

    useEffect(() => {
        cropSrcRef.current = cropSrc;
        logoPreviewRef.current = logoPreview;
    }, [cropSrc, logoPreview]);

    useEffect(() => () => {
        revokeObjectUrl(cropSrcRef.current);
        revokeObjectUrl(logoPreviewRef.current);
    }, []);

    return (
        <form id={formId} onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4">
            {error && (
                <div className="p-4 border-l-4 rounded-r-lg" style={{ backgroundColor: colors.redLight, borderLeftColor: colors.red }}>
                    <p className="body-sm" style={{ color: colors.red }}>{error}</p>
                </div>
            )}

            <div className="space-y-2">
                <label className="label-md block">Logo</label>
                <div className="flex items-center gap-3">
                    <div
                        className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center"
                        style={{ border: `1px solid ${colors.border}` }}
                    >
                        {logoPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-6 h-6" style={{ color: colors.textMuted }} />
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
                            Upload logo
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
            </div>

            <div className="space-y-2">
                <label htmlFor="update-org-name" className="label-md block">Navn</label>
                <TextInput id="update-org-name" name="name" type="text" required value={formData.name} onChange={handleChange} />
            </div>
            {isSuperAdmin && (
                <div className="space-y-2">
                    <label htmlFor="update-org-slug" className="label-md block">Slug</label>
                    <TextInput id="update-org-slug" name="slug" type="text" required value={formData.slug} onChange={handleChange} />
                </div>
            )}
        </form>
    );
}
