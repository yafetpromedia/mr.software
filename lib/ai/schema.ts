import { z } from "zod";

function clip(text: string, max: number): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

/** Accept verbose AI output, then normalize for UI/storage. */
export const startupAdvisorAnalysisSchema = z
  .object({
    projectName: z.string().min(1),
    problem: z.string().min(1),
    solution: z.string().min(1),
    targetUsers: z.array(z.string().min(1)).min(1),
    features: z.array(z.string().min(1)).min(1),
    pricingIdeas: z
      .array(
        z.object({
          name: z.string().min(1),
          price: z.string().min(1),
          rationale: z.string().min(1),
        }),
      )
      .min(1),
    marketOpportunities: z.array(z.string().min(1)).min(1),
    businessModel: z.string().min(1),
    technicalArchitecture: z.object({
      frontend: z.string().min(1),
      backend: z.string().min(1),
      database: z.string().min(1),
      modules: z.array(z.string().min(1)).min(1),
    }),
    deploymentPlan: z.string().min(1),
    monetizationStrategy: z.string().min(1),
  })
  .transform((data) => ({
    projectName: clip(data.projectName, 80),
    problem: clip(data.problem, 800),
    solution: clip(data.solution, 800),
    targetUsers: data.targetUsers.slice(0, 6).map((u) => clip(u, 120)),
    features: data.features.slice(0, 10).map((f) => clip(f, 200)),
    pricingIdeas: data.pricingIdeas.slice(0, 4).map((p) => ({
      name: clip(p.name, 60),
      price: clip(p.price, 40),
      rationale: clip(p.rationale, 200),
    })),
    marketOpportunities: data.marketOpportunities.slice(0, 6).map((m) => clip(m, 200)),
    businessModel: clip(data.businessModel, 600),
    technicalArchitecture: {
      frontend: clip(data.technicalArchitecture.frontend, 200),
      backend: clip(data.technicalArchitecture.backend, 200),
      database: clip(data.technicalArchitecture.database, 120),
      modules: data.technicalArchitecture.modules.slice(0, 12).map((m) => clip(m, 120)),
    },
    deploymentPlan: clip(data.deploymentPlan, 800),
    monetizationStrategy: clip(data.monetizationStrategy, 600),
  }));

export type StartupAdvisorAnalysis = z.infer<typeof startupAdvisorAnalysisSchema>;

export const softwareArchitectSchema = z.object({
  summary: z.string().min(1).max(400),
  frontend: z.string().min(1).max(120),
  backend: z.string().min(1).max(120),
  database: z.string().min(1).max(120),
  modules: z.array(z.string().min(1).max(120)).min(2).max(12),
  apiStructure: z.array(z.string().min(1).max(200)).min(2).max(10),
  deploymentNotes: z.string().min(1).max(500),
});

export type SoftwareArchitectPlan = z.infer<typeof softwareArchitectSchema>;

export const startupAdvisorRequestSchema = z.object({
  idea: z.string().trim().min(3, "Describe your idea").max(2000),
  save: z.boolean().optional().default(true),
});

export const architectRequestSchema = z.object({
  idea: z.string().trim().min(3).max(2000),
  context: z.string().trim().max(4000).optional(),
});
