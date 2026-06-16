import { StartupBuilder } from "@/components/startup/startup-builder";

export const metadata = {
  title: "AI Startup Builder",
  description:
    "Get AI-suggested startup drafts — review, edit, and deploy with beginner or developer control.",
};

export default function BuilderPage() {
  return <StartupBuilder />;
}
