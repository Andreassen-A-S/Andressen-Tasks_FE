import { useState } from "react";
import SingleAvatar from "@/components/common/label/singleAvatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface TaskCommentProps {
    currentUser: { name?: string; email?: string };
    onSubmit: (comment: string) => Promise<void>;
    submitting: boolean;
}

export default function TaskComment({
    currentUser,
    onSubmit,
    submitting,
}: TaskCommentProps) {
    const [comment, setComment] = useState("");

    async function handleSubmit() {
        if (!comment.trim()) return;
        await onSubmit(comment.trim());
        setComment("");
    }

    return (
        <div className="mt-8">
            <div className="flex items-start gap-3">
                <SingleAvatar
                    name={currentUser.name || currentUser.email || "Ukendt bruger"}
                    size="sm"
                />
                <div className="flex-1">
                    {/* Header */}
                    <div className="mb-2 mt-1">
                        <h3 className="h4">Tilføj en kommentar</h3>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Skriv din kommentar her..."
                        disabled={submitting}
                        className="w-full bg-white border border-[#E8E6E1] rounded-lg px-5 py-3 body-md placeholder:text-[#9DA1B4] resize-none min-h-30
                        focus:outline-none focus:ring-2 focus:ring-[#2D9F6F]/30 focus:border-[#2D9F6F]
                        disabled:bg-[#FAFAF7] disabled:text-[#9DA1B4]"
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!comment.trim() || submitting}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#2C5FE0] px-5 py-2.5 btn-md text-white
                            hover:bg-[#4a7af5] transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    Sender...
                                </>
                            ) : (
                                "Kommenter"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}