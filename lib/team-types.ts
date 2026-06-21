/** Client-safe team types — no Prisma imports. */

export type TeamMemberKindValue = "HUMAN" | "AI_CAPABILITY" | "ECOSYSTEM";

export type PublicTeamSectionSettings = {
  eyebrow: string;
  title: string;
  tagline: string;
  intro: string;
};

export type PublicTeamMember = {
  id: string;
  kind: TeamMemberKindValue;
  name: string;
  role: string;
  bio: string;
  avatarUrl?: string;
  monogram?: string;
};

export type AdminTeamMember = {
  id: string;
  kind: TeamMemberKindValue;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string | null;
  monogram: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export const DEFAULT_TEAM_SECTION: PublicTeamSectionSettings = {
  eyebrow: "Team",
  title: "The Modern Startup Team",
  tagline: "Built by a Human. Powered by AI.",
  intro: "Building the future of software with human creativity and AI execution.",
};

export const DEFAULT_TEAM_MEMBERS: Omit<PublicTeamMember, "id">[] = [
  {
    kind: "HUMAN",
    name: "Yafet Tesfaye",
    role: "Founder & Product Architect",
    bio: "Vision, strategy, design, and platform leadership.",
    monogram: "Y",
  },
  {
    kind: "AI_CAPABILITY",
    name: "AI Strategy Partner",
    role: "Product intelligence",
    bio: "Product thinking, business systems, architecture, and innovation.",
    monogram: "AI",
  },
  {
    kind: "AI_CAPABILITY",
    name: "AI Engineering Partner",
    role: "Development acceleration",
    bio: "Implementation, debugging, refactoring, and deployment at startup speed.",
    monogram: "E",
  },
  {
    kind: "ECOSYSTEM",
    name: "The Creator Economy",
    role: "Future ecosystem",
    bio: "Thousands of African developers building software for the world.",
    monogram: "C",
  },
];
