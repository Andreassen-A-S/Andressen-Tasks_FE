"use client";

import { diffLines, diffWordsWithSpace } from "diff";
import type { Change } from "diff";
import Modal from "@/components/modal/Modal";
import { colors } from "@/constants/colors";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    before: string;
    after: string;
    title?: string;
};

const INLINE_MAX_LENGTH = 240;
const INLINE_MIN_CHANGED_LENGTH = 40;
const INLINE_MAX_CHANGED_RATIO = 0.6;

type InlineDiffPart = Change[];

type DiffView =
    | { kind: "inline"; changes: InlineDiffPart }
    | { kind: "block"; before: string; after: string };

function normalizeLineEndings(s: string) {
    return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function normalizeForBlock(s: string) {
    const n = normalizeLineEndings(s);
    if (!n) return n;
    // diffLines tokenizes by keeping \n on each token, so "line" !== "line\n".
    // A consistent trailing newline makes all line tokens comparable across both inputs.
    return n.endsWith("\n") ? n : n + "\n";
}

function isSmallInlineChange(before: string, after: string): boolean {
    const changes = diffWordsWithSpace(before, after);
    const changedLength = changes
        .filter((change) => change.added || change.removed)
        .reduce((total, change) => total + change.value.length, 0);
    const maxLength = Math.max(before.length, after.length);

    const hasUnchangedText = changes.some((change) => !change.added && !change.removed && change.value.trim() !== "");
    const hasOnlyAdditions = changes.some((change) => change.added) && !changes.some((change) => change.removed);
    const hasOnlyRemovals = changes.some((change) => change.removed) && !changes.some((change) => change.added);

    if (hasUnchangedText && (hasOnlyAdditions || hasOnlyRemovals)) {
        return true;
    }

    return maxLength <= INLINE_MAX_LENGTH
        && changedLength <= Math.max(INLINE_MIN_CHANGED_LENGTH, maxLength * INLINE_MAX_CHANGED_RATIO);
}

function getDiffView(before: string, after: string): DiffView {
    const normalizedBefore = normalizeLineEndings(before);
    const normalizedAfter = normalizeLineEndings(after);
    const shouldUseInline = normalizedBefore.trim() !== ""
        && !normalizeLineEndings(before).includes("\n")
        && !normalizeLineEndings(after).includes("\n")
        && isSmallInlineChange(before, after);

    if (shouldUseInline) {
        return { kind: "inline", changes: diffWordsWithSpace(before, after) };
    }

    return { kind: "block", before: normalizedBefore, after: normalizedAfter };
}

function InlineParts({ changes }: { changes: InlineDiffPart }) {
    return (
        <>
            {changes.map((change, i) => {
                if (change.removed) {
                    return (
                        <span key={i} style={{ backgroundColor: "#ffebe9", textDecoration: "line-through", color: "#82071e" }}>
                            {change.value}
                        </span>
                    );
                }
                if (change.added) {
                    return (
                        <span key={i} style={{ backgroundColor: "#e6ffec", color: "#1a7f37" }}>
                            {change.value}
                        </span>
                    );
                }
                return <span key={i}>{change.value}</span>;
            })}
        </>
    );
}

function InlineDiff({ changes }: { changes: InlineDiffPart }) {
    return (
        <div
            className="overflow-auto font-mono text-sm border-y"
            style={{ borderColor: colors.border }}
        >
            <div className="flex items-stretch">
                <span
                    className="w-9 shrink-0 select-none text-center py-0.5 body-xs border-r"
                    style={{ backgroundColor: "#f6f8fa", color: "#8c959f", borderRightColor: colors.border }}
                >
                    {" "}
                </span>
                <span className="flex-1 px-3 py-0.5 whitespace-pre-wrap break-words" style={{ color: colors.textPrimary }}>
                    <InlineParts changes={changes} />
                </span>
            </div>
        </div>
    );
}

type LineEntry =
    | { kind: "context"; text: string }
    | { kind: "removed"; text: string }
    | { kind: "added"; text: string }
    | { kind: "inline"; changes: Change[] };

function buildLineEntries(changes: Change[]): LineEntry[] {
    const entries: LineEntry[] = [];
    let i = 0;
    while (i < changes.length) {
        const c = changes[i];
        if (!c.added && !c.removed) {
            for (const line of c.value.replace(/\n$/, "").split("\n")) {
                entries.push({ kind: "context", text: line });
            }
            i++;
        } else if (c.removed && changes[i + 1]?.added) {
            const removedLines = c.value.replace(/\n$/, "").split("\n");
            const addedLines = changes[i + 1].value.replace(/\n$/, "").split("\n");

            if (removedLines.length === addedLines.length) {
                for (let lineIndex = 0; lineIndex < removedLines.length; lineIndex++) {
                    const removedLine = removedLines[lineIndex];
                    const addedLine = addedLines[lineIndex];

                    if (isSmallInlineChange(removedLine, addedLine)) {
                        entries.push({ kind: "inline", changes: diffWordsWithSpace(removedLine, addedLine) });
                    } else {
                        entries.push({ kind: "removed", text: removedLine });
                        entries.push({ kind: "added", text: addedLine });
                    }
                }
            } else {
                for (const line of removedLines) {
                    entries.push({ kind: "removed", text: line });
                }
                for (const line of addedLines) {
                    entries.push({ kind: "added", text: line });
                }
            }
            i += 2;
        } else if (c.removed) {
            for (const line of c.value.replace(/\n$/, "").split("\n")) {
                entries.push({ kind: "removed", text: line });
            }
            i++;
        } else {
            for (const line of c.value.replace(/\n$/, "").split("\n")) {
                entries.push({ kind: "added", text: line });
            }
            i++;
        }
    }
    return entries;
}

function BlockDiff({ before, after }: { before: string; after: string }) {
    const changes = diffLines(normalizeForBlock(before), normalizeForBlock(after));
    const entries = buildLineEntries(changes);

    return (
        <div
            className="overflow-auto font-mono text-sm border-y border-border"
            style={{ maxHeight: "60vh" }}
        >
            {entries.map((entry, idx) => {
                const isAdded = entry.kind === "added";
                const isRemoved = entry.kind === "removed";
                const isInline = entry.kind === "inline";
                const bg = isAdded ? "#e6ffec" : isRemoved ? "#ffebe9" : undefined;
                const textColor = isAdded ? "#1a7f37" : isRemoved ? "#82071e" : colors.textPrimary;
                const gutterBg = isAdded ? "#ccffd8" : isRemoved ? "#ffcecb" : "#f6f8fa";
                const gutterColor = isAdded ? "#1a7f37" : isRemoved ? "#82071e" : "#8c959f";
                const lineAccent = isAdded ? "#2da44e" : isRemoved ? "#cf222e" : "transparent";
                const prefix = isAdded ? "+" : isRemoved ? "−" : " ";

                return (
                    <div
                        key={idx}
                        className="flex items-stretch"
                        style={{ backgroundColor: bg, borderLeft: `4px solid ${lineAccent}` }}
                    >
                        <span
                            className="w-9 shrink-0 select-none text-center py-0.5 body-xs border-r"
                            style={{
                                backgroundColor: gutterBg,
                                color: gutterColor,
                                borderRightColor: isAdded ? "#b4f1c0" : isRemoved ? "#ffc0bb" : colors.border,
                            }}
                        >
                            {prefix}
                        </span>
                        <span
                            className="flex-1 px-3 py-0.5 whitespace-pre-wrap break-words"
                            style={{ color: textColor }}
                        >
                            {isInline ? (
                                <InlineParts changes={entry.changes} />
                            ) : (
                                <span style={{ textDecoration: isRemoved ? "line-through" : undefined }}>
                                    {entry.text || " "}
                                </span>
                            )}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function ContentDiffModal({ isOpen, onClose, before, after, title = "Ændringer" }: Props) {
    const view = getDiffView(before, after);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="2xl">
            {view.kind === "inline"
                ? <InlineDiff changes={view.changes} />
                : <BlockDiff before={view.before} after={view.after} />
            }
        </Modal>
    );
}
