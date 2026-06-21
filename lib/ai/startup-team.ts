/**
 * AI Startup Team — role definitions for Mr.Software 2.0 Phase D.
 * Used by startup advisor / factory UI to present distinct co-pilot personas.
 */

export const STARTUP_AI_TEAM_ROLES = [
  "founder",
  "strategist",
  "designer",
  "developer",
  "marketer",
] as const;

export type StartupAiTeamRole = (typeof STARTUP_AI_TEAM_ROLES)[number];

export type StartupAiTeamMember = {
  id: StartupAiTeamRole;
  name: string;
  title: string;
  description: string;
  delivers: string[];
};

export const STARTUP_AI_TEAM: StartupAiTeamMember[] = [
  {
    id: "founder",
    name: "You",
    title: "Human Founder",
    description: "Owns the idea, makes final calls, and publishes when ready.",
    delivers: ["Vision", "Approvals", "Go-to-market decisions"],
  },
  {
    id: "strategist",
    name: "Mr Strategist",
    title: "AI Strategist",
    description: "Validates the problem, market, pricing, and business model.",
    delivers: ["Problem/solution fit", "Target users", "Pricing ideas", "Market opportunities"],
  },
  {
    id: "designer",
    name: "Mr Designer",
    title: "AI Designer",
    description: "Shapes brand feel, landing narrative, and first-impression UI direction.",
    delivers: ["Tagline options", "Hero copy", "Color/type direction", "Logo brief"],
  },
  {
    id: "developer",
    name: "Mr Developer",
    title: "AI Developer",
    description: "Proposes architecture, modules, and a practical deploy path on Mr.Software Cloud.",
    delivers: ["Stack recommendation", "Module breakdown", "Deploy checklist"],
  },
  {
    id: "marketer",
    name: "Mr Marketer",
    title: "AI Marketer",
    description: "Prepares launch messaging for storefront, marketplace, and social.",
    delivers: ["Storefront bio draft", "Launch announcement", "Feature bullets"],
  },
];

export function getTeamMember(role: StartupAiTeamRole): StartupAiTeamMember {
  const member = STARTUP_AI_TEAM.find((m) => m.id === role);
  if (!member) throw new Error(`Unknown team role: ${role}`);
  return member;
}
