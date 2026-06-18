import Link from "next/link";
import { StartupBuilder } from "@/components/startup/startup-builder";

export const metadata = {
  title: "SaaS Blueprint Generator",
  description:
    "Generate launch-ready SaaS blueprints with Mr.Software AI — landing drafts and workspace previews.",
};

export default function BlueprintPage() {
  return (
    <div className="space-y-4">
      <Link
        href="/app/ai"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Mr.Software AI
      </Link>
      <StartupBuilder />
    </div>
  );
}
