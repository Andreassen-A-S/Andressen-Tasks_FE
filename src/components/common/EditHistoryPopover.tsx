"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { colors } from "@/constants/colors";
import SingleAvatar from "@/components/common/label/SingleAvatar";
import OutlineBadge from "@/components/common/label/OutlineBadge";
import DropdownMenu from "@/components/common/DropdownMenu";
import type { DropdownMenuItem } from "@/components/common/DropdownMenu";
import Button from "./buttons/Button";
import ContentDiffModal from "./ContentDiffModal";

export type EditHistoryEntry = {
    name: string;
    imageUrl?: string | null;
    timeLabel: string;
    // When provided, the row becomes clickable and opens the diff modal
    beforeText?: string;
    afterText?: string;
};

type Props = {
    edits: EditHistoryEntry[]; // newest-first
    created: EditHistoryEntry;
};

type DiffState = { before: string; after: string; title: string };

export default function EditHistoryPopover({ edits, created }: Props) {
    const [diff, setDiff] = useState<DiffState | null>(null);

    const items: DropdownMenuItem[] = [
        {
            label: `Redigeret ${edits.length} ${edits.length === 1 ? "gang" : "gange"}`,
            disabled: true,
        },
        ...edits.map((entry, i): DropdownMenuItem => ({
            label: "",
            icon: (
                <span className="flex items-center gap-2">
                    <SingleAvatar name={entry.name} size="3xs" imageUrl={entry.imageUrl} />
                    <span className="body-sm" style={{ color: colors.textPrimary }}>{entry.name}</span>
                    <span className="body-xs" style={{ color: colors.textSecondary }}>{entry.timeLabel}</span>
                    {i === 0 && <OutlineBadge label="Nyeste" />}
                </span>
            ),
            onClick: entry.beforeText !== undefined && entry.afterText !== undefined
                ? () => setDiff({ before: entry.beforeText!, after: entry.afterText!, title: `Redigeret ${entry.timeLabel}` })
                : undefined,
        })),
        {
            label: "",
            icon: (
                <span className="flex items-center gap-2">
                    <SingleAvatar name={created.name} size="3xs" imageUrl={created.imageUrl} />
                    <span className="body-sm" style={{ color: colors.textPrimary }}>{created.name}</span>
                    <span className="body-xs" style={{ color: colors.textSecondary }}>oprettet {created.timeLabel}</span>
                </span>
            ),
            onClick: created.afterText !== undefined
                ? () => setDiff({ before: "", after: created.afterText!, title: `Oprettet ${created.timeLabel}` })
                : undefined,
        },
    ];

    const lastEditName = edits[0]?.name ?? "ukendt";

    return (
        <>
            <DropdownMenu
                trigger={
                    <Button variant="ghost">
                        <span><span className="font-normal">Sidst redigeret af </span>{lastEditName}</span>
                        <ChevronDown className="w-3 h-3" />
                    </Button>
                }
                items={items}
            />

            {diff && (
                <ContentDiffModal
                    isOpen
                    onClose={() => setDiff(null)}
                    before={diff.before}
                    after={diff.after}
                    title={diff.title}
                />
            )}
        </>
    );
}
