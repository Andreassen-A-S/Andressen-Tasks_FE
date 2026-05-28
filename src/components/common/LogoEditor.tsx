"use client";

import { useRef } from "react";
import { ImageUp } from "lucide-react";
import Button from "@/components/common/buttons/Button";
import { toast } from "sonner";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface LogoEditorProps {
    imageUrl: string | null;
    loading?: boolean;
    placeholder?: React.ReactNode;
    onFileSelected: (file: File) => void;
}

export default function LogoEditor({
    imageUrl,
    loading = false,
    placeholder,
    onFileSelected,
}: LogoEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col gap-3">
            <div className="w-34 h-34 rounded-xl border border-border overflow-hidden flex items-center justify-center bg-surface-subtle">
                {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    placeholder
                )}
            </div>
            <div className="flex flex-col gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    icon={<ImageUp className="w-4 h-4" />}
                    loading={loading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    Skift logo
                </Button>
            </div>
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
        </div>
    );
}
