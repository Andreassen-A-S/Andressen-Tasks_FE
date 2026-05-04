"use client";

import LinkifyIt from "linkify-it";
import type { CSSProperties, ReactNode } from "react";

const linkify = new LinkifyIt({
  fuzzyEmail: false,
  fuzzyIP: false,
  fuzzyLink: false,
});

type LinkedTextProps = {
  text: string;
  as?: "p" | "span" | "div";
  className?: string;
  style?: CSSProperties;
  linkClassName?: string;
};

export default function LinkedText({
  text,
  as: Component = "span",
  className,
  style,
  linkClassName = "underline hover:opacity-70",
}: LinkedTextProps) {
  const matches = linkify.match(text)?.filter((match) => /^https?:\/\//i.test(match.url)) ?? [];

  if (matches.length === 0) {
    return <Component className={className} style={style}>{text}</Component>;
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match) => {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    nodes.push(
      <a
        key={`${match.index}-${match.lastIndex}`}
        href={match.url}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {text.slice(match.index, match.lastIndex)}
      </a>
    );

    lastIndex = match.lastIndex;
  });

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <Component className={className} style={style}>{nodes}</Component>;
}
