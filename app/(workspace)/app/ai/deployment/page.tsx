import { DeploymentAdvisorClient } from "@/components/ai/deployment-advisor-client";

export const metadata = {
  title: "Deployment Advisor",
  description: "Deployment and hosting guidance from Mr.Software AI.",
};

export default function DeploymentAdvisorPage() {
  return <DeploymentAdvisorClient />;
}
