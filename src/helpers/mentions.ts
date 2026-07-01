import { TOKEN_SRC } from "@/lib/tiptapMentions";

export function tokenToDisplayText(tokenText: string): string {
    return tokenText.replace(new RegExp(TOKEN_SRC, 'g'), '@$1');
}

export function extractMentionUserIds(tokenText: string): string[] {
    const ids: string[] = [];
    const re = new RegExp(TOKEN_SRC, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(tokenText)) !== null) {
        if (!ids.includes(m[2])) ids.push(m[2]);
    }
    return ids;
}
