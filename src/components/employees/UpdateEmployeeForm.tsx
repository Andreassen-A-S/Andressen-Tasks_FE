"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { prepareProfilePicture, updateUser } from "@/lib/api/users";
import { uploadToGcs } from "@/lib/api/attachments";
import { getPositions } from "@/lib/api/positions";
import { UpdateUserInput, User, UserStatus, isAdminRole } from "@/types/users";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { colors } from "@/constants/colors";
import TextInput from "@/components/common/forms/TextInput";
import SelectField from "@/components/common/forms/SelectField";
import Banner from "@/components/common/Banner";
import { formatMissingRequiredFields } from "@/helpers/formValidation";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import Button from "@/components/common/buttons/Button";
import LogoCropModal from "@/components/organizations/LogoCropModal";
import { ImageUp, X } from "lucide-react";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function revokeObjectUrl(url: string | null) {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

interface UpdateEmployeeFormProps {
    formId: string;
    user: User;
    onSuccess: (user: User) => void;
    onLoadingChange?: (loading: boolean) => void;
}

export default function UpdateEmployeeForm({ formId, user, onSuccess, onLoadingChange }: UpdateEmployeeFormProps) {
    const { userRole, contextOrgId } = useAuth();
    const canEditStatus = isAdminRole(userRole);

    const { data: allPositions = [], isLoading: positionsLoading, isError: positionsError } = useQuery({
        queryKey: ["positions", contextOrgId ?? "platform"],
        queryFn: getPositions,
    });

    // Always scope to the user's own org — correct for regular admins and superadmins alike.
    const positions = allPositions.filter(p => p.organization_id === user.organization_id);

    const [formData, setFormData] = useState({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "USER",
        position_id: user.position_id || "",
        status: user.status || UserStatus.ACTIVE,
    });
    const [pictureUrl, setPictureUrl] = useState<string | null>(user.profile_picture_url ?? null);
    const [picturePreview, setPicturePreview] = useState<string | null>(user.profile_picture_url ?? null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [pictureLoading, setPictureLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cropSrcRef = useRef<string | null>(null);
    const picturePreviewRef = useRef<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMissingRequiredBanner, setShowMissingRequiredBanner] = useState(false);

    const missingRequiredFields = useMemo(() => {
        const fields: string[] = [];
        if (!formData.name.trim()) fields.push("navn");
        if (!formData.email.trim()) fields.push("email");
        return fields;
    }, [formData.email, formData.name]);

    const missingRequiredText = useMemo(() => formatMissingRequiredFields(missingRequiredFields), [missingRequiredFields]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error("Kun JPEG, PNG og WebP er tilladt");
            return;
        }
        const src = URL.createObjectURL(file);
        setCropSrc((prev) => { revokeObjectUrl(prev); return src; });
    }

    async function handleCropConfirm(blob: Blob) {
        const nextPreview = URL.createObjectURL(blob);
        setCropSrc((prev) => { revokeObjectUrl(prev); return null; });
        setPicturePreview((prev) => { revokeObjectUrl(prev); return nextPreview; });
        setPictureLoading(true);
        try {
            const { upload_url, gcs_path } = await prepareProfilePicture(user.user_id, blob.type);
            await uploadToGcs(upload_url, new File([blob], "profile.webp", { type: blob.type }));
            setPictureUrl(gcs_path);
        } catch {
            toast.error("Billedupload fejlede. Prøv igen.");
            setPicturePreview((prev) => { revokeObjectUrl(prev); return pictureUrl; });
        } finally {
            setPictureLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const updates: UpdateUserInput = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                position_id: formData.position_id || null,
                ...(canEditStatus ? { status: formData.status } : {}),
            };
            if (formData.password) updates.password = formData.password;
            if (pictureUrl !== user.profile_picture_url) updates.profile_picture_url = pictureUrl;
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
        onLoadingChange?.(loading || pictureLoading);
    }, [loading, pictureLoading, onLoadingChange]);

    useEffect(() => {
        cropSrcRef.current = cropSrc;
        picturePreviewRef.current = picturePreview;
    }, [cropSrc, picturePreview]);

    useEffect(() => () => {
        revokeObjectUrl(cropSrcRef.current);
        revokeObjectUrl(picturePreviewRef.current);
    }, []);

    useEffect(() => {
        if (missingRequiredFields.length === 0) setShowMissingRequiredBanner(false);
    }, [missingRequiredFields.length]);

    function handleInvalidCapture() {
        if (missingRequiredFields.length === 0) return;
        setShowMissingRequiredBanner(true);
        setError(null);
    }

    return (
        <form id={formId} onSubmit={handleSubmit} onInvalidCapture={handleInvalidCapture} className="flex-1 overflow-y-auto space-y-6">
            <p className="body-sm" style={{ color: colors.textSecondary }}>
                Opdater medarbejderens oplysninger, rolle og stilling.
            </p>

            {showMissingRequiredBanner && missingRequiredFields.length > 0 && (
                <Banner variant="warning">
                    Tilføj {missingRequiredText} før medarbejderen kan gemmes.
                </Banner>
            )}

            {error && (
                <Banner variant="warning">
                    {error}
                </Banner>
            )}
            <div className="space-y-4">
                <div>
                    <label className="label-md block mb-2">Profilbillede</label>
                    <div className="flex items-center gap-3">
                        <SingleAvatar name={formData.name || user.email} size="lg" imageUrl={picturePreview} />
                        <div className="flex flex-col gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                icon={<ImageUp className="w-4 h-4" />}
                                loading={pictureLoading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Upload billede
                            </Button>
                            {picturePreview && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    icon={<X className="w-4 h-4" />}
                                    disabled={pictureLoading}
                                    onClick={() => {
                                        setPictureUrl(null);
                                        setPicturePreview((prev) => { revokeObjectUrl(prev); return null; });
                                    }}
                                >
                                    Fjern billede
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
                            onClose={() => setCropSrc((prev) => { revokeObjectUrl(prev); return null; })}
                        />
                    )}
                </div>
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
                    <label htmlFor="position_id" className="label-md block mb-2">Stilling</label>
                    <SelectField
                        id="position_id"
                        name="position_id"
                        value={formData.position_id}
                        onChange={handleChange}
                        disabled={positionsLoading || positionsError}
                    >
                        <option value="">{positionsLoading ? "Indlæser stillinger..." : positionsError ? "Kunne ikke indlæse stillinger" : "Ingen stilling"}</option>
                        {positions.map(pos => (
                            <option key={pos.position_id} value={pos.position_id}>{pos.name}</option>
                        ))}
                        {user.position && !positions.some(p => p.position_id === user.position!.position_id) && (
                            <option value={user.position.position_id}>{user.position.name}</option>
                        )}
                    </SelectField>
                </div>
            </div>
        </form>
    );
}
