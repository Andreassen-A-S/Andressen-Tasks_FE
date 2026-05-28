"use client";

import { useRef } from "react";
import { ImageUp, Pencil, X } from "lucide-react";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import DropdownMenu from "@/components/common/DropdownMenu";
import Button from "@/components/common/buttons/Button";
import { toast } from "sonner";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ImageEditorProps {
    imageUrl: string | null;
    loading?: boolean;
    name?: string;
    onFileSelected: (file: File) => void;
    onRemove: () => void;
}

export default function ImageEditor({
    imageUrl,
    loading = false,
    name = "",
    onFileSelected,
    onRemove,
}: ImageEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const items = [
        {
            label: "Upload billede...",
            icon: <ImageUp className="w-4 h-4" />,
            onClick: () => fileInputRef.current?.click(),
            disabled: loading,
        },
        ...(imageUrl ? [{
            label: "Fjern billede",
            icon: <X className="w-4 h-4" />,
            onClick: onRemove,
            danger: true as const,
            dividerBefore: true,
            disabled: loading,
        }] : []),
    ];

    const trigger = (
        <div className="relative inline-block pb-3 cursor-pointer">
            <SingleAvatar name={name} size="3xl" border imageUrl={imageUrl} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Pencil className="w-3 h-3" />}
                    disabled={loading}
                    className="rounded-full whitespace-nowrap"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                >
                    Rediger
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <DropdownMenu trigger={trigger} items={items} />
            <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                        toast.error("Kun JPEG, PNG og WebP er tilladt");
                        return;
                    }
                    onFileSelected(file);
                }}
                className="hidden"
            />
        </>
    );
}
