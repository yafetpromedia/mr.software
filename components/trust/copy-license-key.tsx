"use client";

import { useState } from "react";

type Props = { licenseKey: string };

export function CopyLicenseKey({ licenseKey }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <code className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm font-semibold tracking-wide text-[var(--foreground)]">
        {licenseKey}
      </code>
      <button
        type="button"
        onClick={() => void copy()}
        className="inline-flex h-9 items-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
