import { useState } from "react";
import SingleAvatar from "@/components/label/singleAvatar";
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
                    <div className="mb-2 mt-[4px]">
                        <h3 className="text-base font-semibold text-gray-900">
                            Tilføj en kommentar
                        </h3>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Skriv din kommentar her..."
                        disabled={submitting}
                        className="w-full bg-white border border-gray-300 rounded-md px-5 py-3 text-base text-gray-900 placeholder:text-gray-400 resize-none min-h-[120px]
                        focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                        disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!comment.trim() || submitting}
                            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white
                            hover:bg-green-700 transition-colors
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