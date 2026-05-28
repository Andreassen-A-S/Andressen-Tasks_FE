"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { prepareProfilePicture, updateUser } from "@/lib/api/users";
import { uploadToGcs } from "@/lib/api/attachments";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import Button from "@/components/common/buttons/Button";
import LogoCropModal from "@/components/organizations/LogoCropModal";
import SettingsSection from "./SettingsSection";
import { ImageUp, X } from "lucide-react";
import { toast } from "sonner";
import { colors } from "@/constants/colors";
import type { User } from "@/types/users";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function revokeObjectUrl(url: string | null) {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

export default function ProfileSettingsSection({ user }: { user: User }) {
    const { updateCurrentUser } = useAuth();
    const [savedUrl, setSavedUrl] = useState<string | null>(user.profile_picture_url ?? null);
    const [preview, setPreview] = useState<string | null>(user.profile_picture_url ?? null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cropSrcRef = useRef<string | null>(null);
    const previewRef = useRef<string | null>(null);

    useEffect(() => {
        cropSrcRef.current = cropSrc;
        previewRef.current = preview;
    }, [cropSrc, preview]);

    useEffect(() => () => {
        revokeObjectUrl(cropSrcRef.current);
        revokeObjectUrl(previewRef.current);
    }, []);

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
        setPreview((prev) => { revokeObjectUrl(prev); return nextPreview; });
        setLoading(true);
        try {
            const { upload_url, gcs_path } = await prepareProfilePicture(user.user_id, blob.type, blob.size);
            await uploadToGcs(upload_url, new File([blob], "profile.webp", { type: blob.type }));
            const updated = await updateUser(user.user_id, { profile_picture_url: gcs_path });
            setSavedUrl(updated.profile_picture_url ?? null);
            updateCurrentUser({ profile_picture_url: updated.profile_picture_url });
            toast.success("Profilbillede opdateret");
        } catch {
            toast.error("Upload fejlede. Prøv igen.");
            setPreview((prev) => { revokeObjectUrl(prev); return savedUrl; });
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove() {
        setLoading(true);
        try {
            await updateUser(user.user_id, { profile_picture_url: null });
            setSavedUrl(null);
            updateCurrentUser({ profile_picture_url: null });
            setPreview((prev) => { revokeObjectUrl(prev); return null; });
            toast.success("Profilbillede fjernet");
        } catch {
            toast.error("Kunne ikke fjerne profilbillede. Prøv igen.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <SettingsSection
            title="Profil"
            description="Dit profilbillede vises på opgaver, kommentarer og i sidebaren."
        >
            <div className="rounded-lg border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.white }}>
                <div className="flex items-center gap-4">
                    <SingleAvatar name={user.name || user.email} size="xxl" border imageUrl={preview} />
                    <div className="flex flex-col gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={<ImageUp className="w-4 h-4" />}
                            loading={loading}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Upload billede
                        </Button>
                        {preview && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                icon={<X className="w-4 h-4" />}
                                disabled={loading}
                                onClick={handleRemove}
                            >
                                Fjern billede
                            </Button>
                        )}
                    </div>
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
                    title="Tilpas profilbillede"
                    round
                />
            )}
        </SettingsSection>
    );
}
