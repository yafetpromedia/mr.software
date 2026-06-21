import { TeamMemberKind, type TeamMember, type TeamSectionSettings } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_TEAM_MEMBERS,
  DEFAULT_TEAM_SECTION,
  type AdminTeamMember,
  type PublicTeamMember,
  type PublicTeamSectionSettings,
} from "@/lib/team-types";

export type { AdminTeamMember, PublicTeamMember, PublicTeamSectionSettings } from "@/lib/team-types";

const SETTINGS_ID = 1;

function toPublicSettings(row: TeamSectionSettings): PublicTeamSectionSettings {
  return {
    eyebrow: row.eyebrow,
    title: row.title,
    tagline: row.tagline,
    intro: row.intro,
  };
}

function toPublicMember(row: TeamMember): PublicTeamMember {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    role: row.role,
    bio: row.bio,
    avatarUrl: row.avatarUrl ?? undefined,
    monogram: row.monogram ?? undefined,
  };
}

function toAdminMember(row: TeamMember): AdminTeamMember {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    role: row.role,
    bio: row.bio,
    avatarUrl: row.avatarUrl,
    monogram: row.monogram,
    published: row.published,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureTeamSectionSettings(): Promise<TeamSectionSettings> {
  return prisma.teamSectionSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      ...DEFAULT_TEAM_SECTION,
    },
    update: {},
  });
}

export async function getPublicTeamSection(): Promise<{
  settings: PublicTeamSectionSettings;
  members: PublicTeamMember[];
}> {
  try {
    const [settingsRow, memberRows] = await Promise.all([
      prisma.teamSectionSettings.findUnique({ where: { id: SETTINGS_ID } }),
      prisma.teamMember.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 12,
      }),
    ]);

    const settings = settingsRow
      ? toPublicSettings(settingsRow)
      : DEFAULT_TEAM_SECTION;

    if (memberRows.length === 0) {
      return {
        settings,
        members: DEFAULT_TEAM_MEMBERS.map((member, index) => ({
          ...member,
          id: `default-${index}`,
        })),
      };
    }

    return {
      settings,
      members: memberRows.map(toPublicMember),
    };
  } catch {
    return {
      settings: DEFAULT_TEAM_SECTION,
      members: DEFAULT_TEAM_MEMBERS.map((member, index) => ({
        ...member,
        id: `default-${index}`,
      })),
    };
  }
}

export async function getTeamSectionForAdmin(): Promise<{
  settings: PublicTeamSectionSettings;
  members: AdminTeamMember[];
}> {
  const settingsRow = await ensureTeamSectionSettings();
  const memberRows = await prisma.teamMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: 50,
  });

  return {
    settings: toPublicSettings(settingsRow),
    members: memberRows.map(toAdminMember),
  };
}

export async function upsertTeamSectionSettings(
  input: PublicTeamSectionSettings,
): Promise<PublicTeamSectionSettings> {
  const row = await prisma.teamSectionSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      ...input,
    },
    update: input,
  });
  return toPublicSettings(row);
}

export async function createTeamMember(input: {
  kind: TeamMemberKind;
  name: string;
  role: string;
  bio: string;
  avatarUrl?: string | null;
  monogram?: string | null;
  published?: boolean;
  sortOrder?: number;
}): Promise<AdminTeamMember> {
  const maxSort = await prisma.teamMember.aggregate({ _max: { sortOrder: true } });
  const row = await prisma.teamMember.create({
    data: {
      kind: input.kind,
      name: input.name,
      role: input.role,
      bio: input.bio,
      avatarUrl: input.avatarUrl?.trim() || null,
      monogram: input.monogram?.trim() || null,
      published: input.published ?? true,
      sortOrder: input.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
    },
  });
  return toAdminMember(row);
}

export async function updateTeamMember(
  id: string,
  input: Partial<{
    kind: TeamMemberKind;
    name: string;
    role: string;
    bio: string;
    avatarUrl: string | null;
    monogram: string | null;
    published: boolean;
    sortOrder: number;
  }>,
): Promise<AdminTeamMember | null> {
  const existing = await prisma.teamMember.findUnique({ where: { id } });
  if (!existing) return null;

  const row = await prisma.teamMember.update({
    where: { id },
    data: {
      kind: input.kind,
      name: input.name,
      role: input.role,
      bio: input.bio,
      avatarUrl:
        input.avatarUrl === undefined
          ? undefined
          : input.avatarUrl?.trim()
            ? input.avatarUrl.trim()
            : null,
      monogram:
        input.monogram === undefined
          ? undefined
          : input.monogram?.trim()
            ? input.monogram.trim()
            : null,
      published: input.published,
      sortOrder: input.sortOrder,
    },
  });
  return toAdminMember(row);
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const existing = await prisma.teamMember.findUnique({ where: { id } });
  if (!existing) return false;
  await prisma.teamMember.delete({ where: { id } });
  return true;
}

export async function seedDefaultTeamContent(): Promise<void> {
  await ensureTeamSectionSettings();
  const count = await prisma.teamMember.count();
  if (count > 0) return;

  await prisma.teamMember.createMany({
    data: DEFAULT_TEAM_MEMBERS.map((member, index) => ({
      kind: member.kind as TeamMemberKind,
      name: member.name,
      role: member.role,
      bio: member.bio,
      monogram: member.monogram ?? null,
      published: true,
      sortOrder: index + 1,
    })),
  });
}
