import { z } from "zod";

export const developerIdentitySchema = z.object({
  name: z.string().trim().max(120).optional(),
  handle: z.string().trim().max(64).optional(),
  organization: z.string().trim().max(120).optional(),
  country: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  role: z.string().trim().max(160).optional(),
  website: z.string().trim().max(320).optional(),
  email: z.string().trim().max(320).optional(),
});

export const developerVisionSchema = z.object({
  mission: z.string().trim().max(500).optional(),
  primaryPlatform: z.string().trim().max(120).optional(),
  company: z.string().trim().max(120).optional(),
});

export const developerProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.string().trim().max(120).optional(),
  status: z.string().trim().max(40).optional(),
});

export const creatorDnaSchema = z.object({
  designStyle: z.string().trim().max(200).optional(),
  preferredColors: z.array(z.string().trim().min(1).max(80)).max(12).optional(),
  focus: z.array(z.string().trim().min(1).max(120)).max(16).optional(),
  values: z.array(z.string().trim().min(1).max(120)).max(16).optional(),
});

export const aiTeamSchema = z.object({
  founder: z.string().trim().max(120).optional(),
  aiArchitect: z.string().trim().max(120).optional(),
  aiDeveloper: z.string().trim().max(120).optional(),
});

export const developerProfileJsonSchema = z.object({
  developer: developerIdentitySchema.optional(),
  vision: developerVisionSchema.optional(),
  projects: z.array(developerProjectSchema).max(24).optional(),
  skills: z.array(z.string().trim().min(1).max(80)).max(24).optional(),
});

export const developerMemoryUpdateSchema = z.object({
  profile: developerProfileJsonSchema.optional(),
  creatorDna: creatorDnaSchema.optional(),
  team: aiTeamSchema.optional(),
  currentProjectName: z.string().trim().max(120).optional().nullable(),
  currentProjectCategory: z.string().trim().max(120).optional().nullable(),
  aiContextNotes: z.string().trim().max(4000).optional().nullable(),
});

export type DeveloperIdentity = z.infer<typeof developerIdentitySchema>;
export type DeveloperVision = z.infer<typeof developerVisionSchema>;
export type DeveloperProject = z.infer<typeof developerProjectSchema>;
export type CreatorDna = z.infer<typeof creatorDnaSchema>;
export type AiTeam = z.infer<typeof aiTeamSchema>;
export type DeveloperProfileJson = z.infer<typeof developerProfileJsonSchema>;
export type DeveloperMemoryUpdate = z.infer<typeof developerMemoryUpdateSchema>;

export type DeveloperMemoryProfileView = {
  profile: DeveloperProfileJson;
  creatorDna: CreatorDna;
  team: AiTeam;
  currentProjectName: string | null;
  currentProjectCategory: string | null;
  aiContextNotes: string | null;
  builtByLine: string;
  aiContextYaml: string;
  updatedAt: string | null;
};
