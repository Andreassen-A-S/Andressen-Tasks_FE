"use client";

import LinkifyIt from "linkify-it";
import type { CSSProperties, ReactNode } from "react";
import type { MentionableUser } from "@/types/users";
import UserCard from "@/components/common/UserCard";

const linkify = new LinkifyIt({
  fuzzyEmail: false,
  fuzzyIP: false,
  fuzzyLink: false,
});

const MENTION_BOUNDARY = /[\s.,!?;:)\]}>"']/;

type LinkedTextProps = {
  text: string;
  as?: "p" | "span" | "div";
  className?: string;
  style?: CSSProperties;
  linkClassName?: string;
  mentionableUsers?: MentionableUser[];
};

type MentionSegment = { type: "text"; value: string } | { type: "mention"; value: string; user: MentionableUser };

function splitPlainMentions(value: string, mentionableUsers: MentionableUser[]): MentionSegment[] {
  const users = [...mentionableUsers].sort((a, b) => b.name.length - a.name.length);
  if (users.length === 0) return [{ type: "text", value }];

  const parts: MentionSegment[] = [];
  let index = 0;

  while (index < value.length) {
    const at = value.indexOf("@", index);
    if (at === -1) break;

    const previous = at === 0 ? "" : value[at - 1];
    if (previous && !MENTION_BOUNDARY.test(previous)) {
      index = at + 1;
      continue;
    }

    const match = users.find((u) => {
      if (value.slice(at + 1, at + 1 + u.name.length) !== u.name) return false;
      const next = value[at + 1 + u.name.length] ?? "";
      return !next || MENTION_BOUNDARY.test(next);
    });

    if (!match) {
      index = at + 1;
      continue;
    }

    if (at > index) parts.push({ type: "text", value: value.slice(index, at) });
    parts.push({ type: "mention", value: `@${match.name}`, user: match });
    index = at + 1 + match.name.length;
  }

  if (index < value.length) parts.push({ type: "text", value: value.slice(index) });
  return parts.length > 0 ? parts : [{ type: "text", value }];
}

export default function LinkedText({
  text,
  as: Component = "span",
  className,
  style,
  linkClassName = "underline hover:opacity-70",
  mentionableUsers = [],
}: LinkedTextProps) {
  const urlMatches = linkify.match(text)?.filter((match) => /^https?:\/\//i.test(match.url)) ?? [];

  if (urlMatches.length === 0 && mentionableUsers.length === 0) {
    return <Component className={className} style={style}>{text}</Component>;
  }

  const urlParts: { type: "text" | "link"; value: string; url?: string }[] = [];
  let lastIndex = 0;

  urlMatches.forEach((match) => {
    if (match.index > lastIndex) {
      urlParts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    urlParts.push({ type: "link", value: text.slice(match.index, match.lastIndex), url: match.url });
    lastIndex = match.lastIndex;
  });

  if (lastIndex < text.length) {
    urlParts.push({ type: "text", value: text.slice(lastIndex) });
  }

  if (urlParts.length === 0) {
    urlParts.push({ type: "text", value: text });
  }

  const nodes: ReactNode[] = [];
  urlParts.forEach((part, partIdx) => {
    if (part.type === "link") {
      nodes.push(
        <a
          key={`link-${partIdx}`}
          href={part.url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {part.value}
        </a>
      );
      return;
    }

    splitPlainMentions(part.value, mentionableUsers).forEach((seg, segIdx) => {
      if (seg.type === "mention") {
        nodes.push(
          <UserCard key={`mention-${partIdx}-${segIdx}`} userId={seg.user.user_id} name={seg.user.name}>
            <span className="font-semibold cursor-pointer underline">{seg.value}</span>
          </UserCard>
        );
      } else {
        nodes.push(seg.value);
      }
    });
  });

  return <Component className={className} style={style}>{nodes}</Component>;
}
