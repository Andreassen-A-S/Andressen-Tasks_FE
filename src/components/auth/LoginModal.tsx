"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import Modal from "@/components/modal/Modal";
import { colors } from "@/constants/colors";
import TextInput from "../common/forms/TextInput";
import Button from "../common/buttons/Button";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();

    function handleClose() {
        setEmail("");
        setPassword("");
        setError(null);
        onClose();
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) return;
        try {
            setIsLoading(true);
            setError(null);
            await login(email, password);
            handleClose();
            onSuccess();
        } catch {
            setError("Forkert email eller adgangskode. Prøv igen.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Tilføj konto" maxWidth="xs">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="flex flex-col items-center gap-2 my-4">
                    <Image src="/logo.png" alt="MesterPlan" width={100} height={38} className="rounded-md" />
                    <p className="body-sm" style={{ color: colors.textMuted }}>Log ind med en anden konto</p>
                </div>

                <div>
                    <label htmlFor="add-account-email" className="label-lg block mb-1.5">Email</label>
                    <TextInput
                        id="add-account-email"
                        type="email"
                        inputSize="lg"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="navn@virksomhed.dk"
                    />
                </div>

                <div>
                    <label htmlFor="add-account-password" className="label-lg block mb-1.5">Adgangskode</label>
                    <TextInput
                        id="add-account-password"
                        inputSize="lg"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        sensitive={true}
                    />
                </div>

                {error && (
                    <div className="rounded-lg bg-danger-surface border border-danger-border px-4 py-3">
                        <p className="body-sm text-danger">{error}</p>
                    </div>
                )}
                <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={!email || !password || isLoading}
                    fullWidth={true}
                >
                    {isLoading ? "Logger ind..." : "Log ind"}
                </Button>
            </form>
        </Modal>
    );
}
