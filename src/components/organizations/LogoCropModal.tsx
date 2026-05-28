"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import Modal from "@/components/modal/Modal";
import Button from "@/components/common/buttons/Button";
import { colors } from "@/constants/colors";

interface LogoCropModalProps {
    imageSrc: string;
    onConfirm: (blob: Blob) => void;
    onClose: () => void;
    title?: string;
    round?: boolean;
}

const OUTPUT_SIZE = 512;

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = reject;
        image.src = imageSrc;
    });

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, OUTPUT_SIZE, OUTPUT_SIZE,
    );

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")), "image/webp", 0.9);
    });
}

export default function LogoCropModal({ imageSrc, onConfirm, onClose, title = "Tilpas logo", round = false }: LogoCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedArea, setCroppedArea] = useState<Area | null>(null);
    const [loading, setLoading] = useState(false);

    const onCropComplete = useCallback((_: Area, pixels: Area) => {
        setCroppedArea(pixels);
    }, []);

    async function handleConfirm() {
        if (!croppedArea) return;
        setLoading(true);
        try {
            const blob = await getCroppedBlob(imageSrc, croppedArea);
            onConfirm(blob);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={title}
            maxWidth="sm"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="md" onClick={onClose}>Annuller</Button>
                    <Button variant="primary" size="md" loading={loading} onClick={handleConfirm}>Gem</Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="relative w-full rounded-lg overflow-hidden" style={{ height: 320, backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)", backgroundSize: "16px 16px", backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px", backgroundColor: "#fff" }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        minZoom={0.3}
                        aspect={1}
                        cropShape={round ? "round" : "rect"}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        restrictPosition={false}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="label-sm" style={{ color: colors.textMuted }}>Zoom</span>
                    <input
                        type="range"
                        min={0.3}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={e => setZoom(Number(e.target.value))}
                        className="flex-1 accent-accent"
                    />
                </div>
            </div>
        </Modal>
    );
}
