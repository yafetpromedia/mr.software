import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LandingBelowFold } from "@/components/landing/landing-below-fold";
import { LandingHeroSection } from "@/components/landing/landing-hero-section";
import { LandingSectionPlaceholder } from "@/components/landing/landing-section-placeholder";
import { getSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSession();
  if (session) {
    if (session.role === "ADMIN") redirect("/admin");
    if (session.role === "USER") redirect("/app/home");
    redirect("/app");
  }

  return (
    <div className="flex-1 overflow-x-hidden bg-[var(--background)]">
      <LandingHeroSection />
      <Suspense fallback={<LandingSectionPlaceholder className="h-[120vh]" />}>
        <LandingBelowFold />
      </Suspense>
    </div>
  );
}
