import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Brain,
  Cloud,
  Rocket,
  ShieldCheck,
  Store,
} from "lucide-react";

/** Flat Lucide icons keyed by academy course slug. */
export const COURSE_ICONS: Record<string, LucideIcon> = {
  "publish-your-first-product": Rocket,
  "deploy-and-monetize": Cloud,
  "african-payments": Banknote,
  "build-with-mr-software-ai": Brain,
  "trust-ownership-licensing": ShieldCheck,
  "saas-factory-go-to-market": Store,
};

export function getCourseIcon(slug: string): LucideIcon {
  return COURSE_ICONS[slug] ?? Rocket;
}
