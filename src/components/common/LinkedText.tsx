"use client";

import LinkifyIt from "linkify-it";
import type { CSSProperties, ReactNode } from "react";
import UserCard from "@/components/common/UserCard";

const linkify = new LinkifyIt({
  fuzzyEmail: false,
  fuzzyIP: false,
  fuzzyLink: false,
});

const TOKEN_SRC = String.raw`@\[([^\]]+)\]\(([^)]+)\)`;

type LinkedTextProps = {
  text: string;
  as?: "p" | "span" | "div";
  className?: string;
  style?: CSSProperties;
  linkClassName?: string;
};

type Segment =
  | { type: "text"; value: string }
  | { type: "mention"; name: string; userId: string };

function splitMentionTokens(text: string): Segment[] {
  const re = new RegExp(TOKEN_SRC, "g");
  const parts: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", value: text.slice(last, m.index) });
    parts.push({ type: "mention", name: m[1], userId: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}

export default function LinkedText({
  text,
  as: Component = "span",
  className,
  style,
  linkClassName = "underline hover:opacity-70",
}: LinkedTextProps) {
  const urlMatches = linkify.match(text)?.filter((match) => /^https?:\/\//i.test(match.url)) ?? [];

  if (urlMatches.length === 0 && !text.includes("@[")) {
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

  if (lastIndex < text.length) urlParts.push({ type: "text", value: text.slice(lastIndex) });
  if (urlParts.length === 0) urlParts.push({ type: "text", value: text });

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

    splitMentionTokens(part.value).forEach((seg, segIdx) => {
      if (seg.type === "mention") {
        nodes.push(
          <UserCard key={`mention-${partIdx}-${segIdx}`} userId={seg.userId} name={seg.name}>
            <span className="font-semibold cursor-pointer underline">@{seg.name}</span>
          </UserCard>
        );
      } else {
        nodes.push(seg.value);
      }
    });
  });

  return <Component className={className} style={style}>{nodes}</Component>;
}
