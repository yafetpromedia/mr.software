import {
  aiTeamSchema,
  creatorDnaSchema,
  developerProfileJsonSchema,
  type AiTeam,
  type CreatorDna,
  type DeveloperMemoryProfileView,
  type DeveloperMemoryUpdate,
  type DeveloperProfileJson,
} from "@/lib/ai/developer-memory/schema";
import {
  DEFAULT_AI_TEAM,
  EMPTY_CREATOR_DNA,
  EMPTY_PROFILE,
  PLATFORM_DEFAULTS,
} from "@/lib/ai/developer-memory/defaults";
import { prisma } from "@/lib/prisma";

function parseJsonField<T>(
  raw: unknown,
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T } },
  fallback: T,
): T {
  const parsed = schema.safeParse(raw);
  return parsed.success && parsed.data !== undefined ? parsed.data : fallback;
}

function locationLabel(developer: DeveloperProfileJson["developer"]): string | null {
  if (!developer) return null;
  const parts = [developer.city, developer.country].filter(Boolean);
  if (parts.length === 0) return developer.country ?? null;
  return parts.join(", ");
}

export function buildBuiltByLine(team: AiTeam, developerName?: string): string {
  const founder = team.founder?.trim() || developerName?.trim();
  const architect = team.aiArchitect?.trim() || DEFAULT_AI_TEAM.aiArchitect;
  const developer = team.aiDeveloper?.trim() || DEFAULT_AI_TEAM.aiDeveloper;

  if (!founder) {
    return `Built with ${architect} and ${developer}`;
  }

  return `Built by:\n${founder}\nwith ${architect} and ${developer}`;
}

export function buildAiContextYaml(input: {
  profile: DeveloperProfileJson;
  creatorDna: CreatorDna;
  team: AiTeam;
  currentProjectName: string | null;
  currentProjectCategory: string | null;
  aiContextNotes: string | null;
}): string {
  const { profile, creatorDna, team, currentProjectName, currentProjectCategory, aiContextNotes } =
    input;
  const dev = profile.developer;
  const vision = profile.vision;
  const lines: string[] = [];

  const creatorLines: string[] = [];
  if (dev?.name) creatorLines.push(`  name: ${dev.name}`);
  if (dev?.organization || vision?.company) {
    creatorLines.push(`  company: ${dev?.organization ?? vision?.company}`);
  }
  const loc = locationLabel(dev);
  if (loc) creatorLines.push(`  location: ${loc}`);
  if (dev?.handle) creatorLines.push(`  handle: ${dev.handle}`);
  if (dev?.role) creatorLines.push(`  role: ${dev.role}`);
  if (creatorLines.length > 0) {
    lines.push("creator:", ...creatorLines);
  }

  const platformMission = vision?.mission ?? PLATFORM_DEFAULTS.mission;
  const platformName = vision?.primaryPlatform ?? PLATFORM_DEFAULTS.name;
  lines.push("platform:", `  name: ${platformName}`, `  mission: ${platformMission}`);

  if (currentProjectName) {
    lines.push("current_project:", `  name: ${currentProjectName}`);
    if (currentProjectCategory) {
      lines.push(`  category: ${currentProjectCategory}`);
    }
  }

  const dnaLines: string[] = [];
  if (creatorDna.designStyle) dnaLines.push(`  design_style: ${creatorDna.designStyle}`);
  if (creatorDna.preferredColors?.length) {
    dnaLines.push(`  preferred_colors: ${creatorDna.preferredColors.join(", ")}`);
  }
  if (creatorDna.focus?.length) dnaLines.push(`  focus: ${creatorDna.focus.join(", ")}`);
  if (creatorDna.values?.length) dnaLines.push(`  values: ${creatorDna.values.join(", ")}`);
  if (dnaLines.length > 0) {
    lines.push("creator_dna:", ...dnaLines);
  }

  const teamLines: string[] = [];
  const founder = team.founder?.trim() || dev?.name?.trim();
  if (founder) teamLines.push(`  founder: ${founder}`);
  if (team.aiArchitect) teamLines.push(`  ai_architect: ${team.aiArchitect}`);
  if (team.aiDeveloper) teamLines.push(`  ai_developer: ${team.aiDeveloper}`);
  if (teamLines.length > 0) {
    lines.push("team:", ...teamLines);
  }

  if (profile.skills?.length) {
    lines.push("skills:", `  - ${profile.skills.join("\n  - ")}`);
  }

  if (profile.projects?.length) {
    lines.push("projects:");
    for (const p of profile.projects) {
      const meta = [p.type, p.status].filter(Boolean).join(" · ");
      lines.push(`  - ${p.name}${meta ? ` (${meta})` : ""}`);
    }
  }

  if (aiContextNotes?.trim()) {
    lines.push("ai_notes:", `  ${aiContextNotes.trim().replace(/\n/g, "\n  ")}`);
  }

  return lines.join("\n");
}

function mergeWithAccountDefaults(
  profile: DeveloperProfileJson,
  account: { name: string; email: string; handle?: string | null; website?: string | null },
): DeveloperProfileJson {
  const developer = { ...profile.developer };
  if (!developer.name) developer.name = account.name;
  if (!developer.email) developer.email = account.email;
  if (!developer.handle && account.handle) developer.handle = `@${account.handle}`;
  if (!developer.website && account.website) developer.website = account.website;

  return {
    ...profile,
    developer: Object.keys(developer).length > 0 ? developer : profile.developer,
    vision: profile.vision ?? {
      primaryPlatform: PLATFORM_DEFAULTS.name,
      mission: PLATFORM_DEFAULTS.mission,
    },
  };
}

function toView(
  raw: {
    profileJson: unknown;
    creatorDnaJson: unknown;
    teamJson: unknown;
    currentProjectName: string | null;
    currentProjectCategory: string | null;
    aiContextNotes: string | null;
    updatedAt: Date | null;
  },
  account: { name: string; email: string; handle?: string | null; website?: string | null },
): DeveloperMemoryProfileView {
  const profile = parseJsonField(raw.profileJson, developerProfileJsonSchema, EMPTY_PROFILE);
  const creatorDna = parseJsonField(raw.creatorDnaJson, creatorDnaSchema, EMPTY_CREATOR_DNA);
  const team = parseJsonField(raw.teamJson, aiTeamSchema, {
    ...DEFAULT_AI_TEAM,
    founder: profile.developer?.name ?? account.name,
  });

  const mergedProfile = mergeWithAccountDefaults(profile, account);
  const dev = mergedProfile.developer;
  const resolvedTeam: AiTeam = {
    ...team,
    founder: team.founder?.trim() || dev?.name || account.name,
    aiArchitect: team.aiArchitect?.trim() || DEFAULT_AI_TEAM.aiArchitect,
    aiDeveloper: team.aiDeveloper?.trim() || DEFAULT_AI_TEAM.aiDeveloper,
  };

  const aiContextYaml = buildAiContextYaml({
    profile: mergedProfile,
    creatorDna,
    team: resolvedTeam,
    currentProjectName: raw.currentProjectName,
    currentProjectCategory: raw.currentProjectCategory,
    aiContextNotes: raw.aiContextNotes,
  });

  return {
    profile: mergedProfile,
    creatorDna,
    team: resolvedTeam,
    currentProjectName: raw.currentProjectName,
    currentProjectCategory: raw.currentProjectCategory,
    aiContextNotes: raw.aiContextNotes,
    builtByLine: buildBuiltByLine(resolvedTeam, dev?.name ?? account.name),
    aiContextYaml,
    updatedAt: raw.updatedAt?.toISOString() ?? null,
  };
}

async function loadAccountContext(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      storefront: { select: { handle: true, website: true } },
    },
  });
  if (!user) return null;
  return {
    name: user.name,
    email: user.email,
    handle: user.storefront?.handle ?? null,
    website: user.storefront?.website ?? null,
  };
}

export async function getDeveloperMemoryProfile(
  userId: string,
): Promise<DeveloperMemoryProfileView | null> {
  const account = await loadAccountContext(userId);
  if (!account) return null;

  const record = await prisma.developerMemoryProfile.findUnique({ where: { userId } });
  if (!record) {
    return toView(
      {
        profileJson: {},
        creatorDnaJson: {},
        teamJson: DEFAULT_AI_TEAM,
        currentProjectName: null,
        currentProjectCategory: null,
        aiContextNotes: null,
        updatedAt: null,
      },
      account,
    );
  }

  return toView(record, account);
}

export async function upsertDeveloperMemoryProfile(
  userId: string,
  input: DeveloperMemoryUpdate,
): Promise<DeveloperMemoryProfileView> {
  const account = await loadAccountContext(userId);
  if (!account) throw new Error("User not found");

  const existing = await prisma.developerMemoryProfile.findUnique({ where: { userId } });

  const currentProfile = existing
    ? parseJsonField(existing.profileJson, developerProfileJsonSchema, EMPTY_PROFILE)
    : EMPTY_PROFILE;
  const currentDna = existing
    ? parseJsonField(existing.creatorDnaJson, creatorDnaSchema, EMPTY_CREATOR_DNA)
    : EMPTY_CREATOR_DNA;
  const currentTeam = existing
    ? parseJsonField(existing.teamJson, aiTeamSchema, DEFAULT_AI_TEAM)
    : { ...DEFAULT_AI_TEAM, founder: account.name };

  const record = await prisma.developerMemoryProfile.upsert({
    where: { userId },
    create: {
      userId,
      profileJson: input.profile ?? currentProfile,
      creatorDnaJson: input.creatorDna ?? currentDna,
      teamJson: input.team ?? currentTeam,
      currentProjectName: input.currentProjectName ?? null,
      currentProjectCategory: input.currentProjectCategory ?? null,
      aiContextNotes: input.aiContextNotes ?? null,
    },
    update: {
      ...(input.profile !== undefined ? { profileJson: input.profile } : {}),
      ...(input.creatorDna !== undefined ? { creatorDnaJson: input.creatorDna } : {}),
      ...(input.team !== undefined ? { teamJson: input.team } : {}),
      ...(input.currentProjectName !== undefined
        ? { currentProjectName: input.currentProjectName }
        : {}),
      ...(input.currentProjectCategory !== undefined
        ? { currentProjectCategory: input.currentProjectCategory }
        : {}),
      ...(input.aiContextNotes !== undefined ? { aiContextNotes: input.aiContextNotes } : {}),
    },
  });

  return toView(record, account);
}

export async function seedDeveloperMemoryProfile(
  userId: string,
  data: {
    profile: DeveloperProfileJson;
    creatorDna: CreatorDna;
    team: AiTeam;
    currentProjectName?: string;
    currentProjectCategory?: string;
  },
): Promise<void> {
  await prisma.developerMemoryProfile.upsert({
    where: { userId },
    create: {
      userId,
      profileJson: data.profile,
      creatorDnaJson: data.creatorDna,
      teamJson: data.team,
      currentProjectName: data.currentProjectName ?? null,
      currentProjectCategory: data.currentProjectCategory ?? null,
    },
    update: {
      profileJson: data.profile,
      creatorDnaJson: data.creatorDna,
      teamJson: data.team,
      currentProjectName: data.currentProjectName ?? null,
      currentProjectCategory: data.currentProjectCategory ?? null,
    },
  });
}
