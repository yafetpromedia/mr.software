"use client";

import type { FactoryStep } from "@prisma/client";
import { Check } from "lucide-react";
import { FACTORY_STEP_LABELS, FACTORY_STEP_ORDER } from "@/lib/factory/types";

type Props = {
  current: FactoryStep;
  completed: Set<FactoryStep>;
  onStepClick?: (step: FactoryStep) => void;
};

export function FactoryStepIndicator({ current, completed, onStepClick }: Props) {
  const visible = FACTORY_STEP_ORDER.filter((s) => s !== "COMPLETE");

  return (
    <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {visible.map((step, index) => {
        const done = completed.has(step);
        const active = step === current;
        const clickable = onStepClick && (done || active);

        return (
          <li key={step} className="flex items-center gap-1.5 sm:gap-2">
            {index > 0 ? (
              <span className="hidden h-px w-3 bg-[var(--border)] sm:block sm:w-4" aria-hidden />
            ) : null}
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(step)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold transition sm:px-3 sm:text-xs ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                  : done
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)]"
              } ${clickable ? "cursor-pointer hover:border-[var(--accent)]/40" : "cursor-default opacity-80"}`}
            >
              {done ? <Check className="h-3 w-3 shrink-0" aria-hidden /> : null}
              {FACTORY_STEP_LABELS[step]}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
