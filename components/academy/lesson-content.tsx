"use client";

import type { ReactNode } from "react";

function inlineFormat(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-stone-900 dark:text-[var(--foreground)]">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="rounded-md bg-stone-100 px-1.5 py-0.5 font-mono text-[0.85em] text-orange-800 dark:bg-[var(--surface-elevated)] dark:text-[var(--accent)]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            className="font-medium text-orange-600 underline decoration-orange-300 underline-offset-2 hover:text-orange-500 dark:text-[var(--accent)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>,
        );
      }
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function renderBlock(block: string, index: number) {
  const trimmed = block.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("|")) {
    const rows = trimmed.split("\n").filter((line) => line.trim().startsWith("|"));
    if (rows.length >= 2) {
      const parseRow = (line: string) =>
        line
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim());
      const header = parseRow(rows[0]);
      const bodyRows = rows.slice(2).map(parseRow);
      return (
        <div key={index} className="my-6 overflow-x-auto rounded-xl border border-stone-200 dark:border-[var(--border)]">
          <table className="w-full min-w-[16rem] text-left text-sm">
            <thead className="bg-stone-50 dark:bg-[var(--surface-elevated)]">
              <tr>
                {header.map((cell, i) => (
                  <th key={i} className="px-4 py-2.5 font-semibold text-stone-900 dark:text-[var(--foreground)]">
                    {inlineFormat(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} className="border-t border-stone-100 dark:border-[var(--border)]">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2.5 text-stone-700 dark:text-[var(--foreground)]">
                      {inlineFormat(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  if (trimmed.startsWith("### ")) {
    return (
      <h4
        key={index}
        className="mt-6 mb-2 text-base font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)]"
      >
        {inlineFormat(trimmed.slice(4))}
      </h4>
    );
  }

  if (trimmed.startsWith("## ")) {
    return (
      <h3
        key={index}
        className="mt-8 mb-3 text-lg font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)] first:mt-0"
      >
        {inlineFormat(trimmed.slice(3))}
      </h3>
    );
  }

  if (trimmed.startsWith("> ")) {
    const lines = trimmed.split("\n").map((line) => line.replace(/^>\s?/, ""));
    return (
      <blockquote
        key={index}
        className="my-4 border-l-4 border-orange-400/60 bg-orange-50/50 py-3 pl-4 pr-3 text-sm italic leading-relaxed text-stone-700 dark:border-[var(--accent)]/40 dark:bg-[var(--accent-muted)]/30 dark:text-[var(--foreground)]"
      >
        {lines.map((line, i) => (
          <p key={i}>{inlineFormat(line)}</p>
        ))}
      </blockquote>
    );
  }

  if (trimmed === "---") {
    return <hr key={index} className="my-8 border-stone-200 dark:border-[var(--border)]" />;
  }

  if (trimmed.startsWith("```")) {
    const lines = trimmed.split("\n");
    const code = lines.slice(1, lines[lines.length - 1] === "```" ? -1 : undefined).join("\n");
    return (
      <pre
        key={index}
        className="my-4 overflow-x-auto rounded-xl border border-stone-200 bg-stone-950 p-4 text-sm leading-relaxed text-stone-100 dark:border-[var(--border)]"
      >
        <code>{code}</code>
      </pre>
    );
  }

  const lines = trimmed.split("\n");
  const isBulletList = lines.every((line) => /^[-*]\s/.test(line.trim()));
  const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line.trim()));

  if (isBulletList) {
    return (
      <ul key={index} className="my-4 list-disc space-y-2 pl-5 text-base leading-relaxed">
        {lines.map((line, i) => (
          <li key={i} className="text-stone-700 dark:text-[var(--foreground)]">
            {inlineFormat(line.replace(/^[-*]\s/, ""))}
          </li>
        ))}
      </ul>
    );
  }

  if (isNumberedList) {
    return (
      <ol key={index} className="my-4 list-decimal space-y-2 pl-5 text-base leading-relaxed">
        {lines.map((line, i) => (
          <li key={i} className="text-stone-700 dark:text-[var(--foreground)]">
            {inlineFormat(line.replace(/^\d+\.\s/, ""))}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <p key={index} className="my-4 text-base leading-[1.8] text-stone-700 dark:text-[var(--foreground)]">
      {inlineFormat(trimmed.replace(/\n/g, " "))}
    </p>
  );
}

export function LessonContent({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/);
  return <div className="lesson-prose max-w-none">{blocks.map(renderBlock)}</div>;
}
