import { Suspense } from "react";
import { StartupAdvisorClient } from "@/components/ai/startup-advisor-client";

export const metadata = {
  title: "Startup Advisor",
  description:
    "Analyze startup ideas with Mr.Software AI — business model, architecture, and launch planning.",
};

function AdvisorFallback() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-4 p-4">
      <div className="h-8 w-64 rounded-lg bg-[var(--surface-muted)]/50" />
      <div className="h-4 w-96 rounded bg-[var(--surface-muted)]/40" />
      <div className="h-40 rounded-2xl bg-[var(--surface-muted)]/30" />
    </div>
  );
}

export default function StartupAdvisorPage() {
  return (
    <Suspense fallback={<AdvisorFallback />}>
      <StartupAdvisorClient />
    </Suspense>
  );
}
