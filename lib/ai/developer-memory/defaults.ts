import type { AiTeam, CreatorDna, DeveloperProfileJson } from "@/lib/ai/developer-memory/schema";
import {
  BRAND_AI_NAME,
  BRAND_DOMAIN,
  BRAND_NAME,
  BRAND_URL,
} from "@/lib/branding/constants";

export const PLATFORM_DEFAULTS = {
  name: BRAND_NAME,
  domain: BRAND_DOMAIN,
  url: BRAND_URL,
  mission: "African software business ecosystem",
} as const;

/** Canonical Mr.Software ownership — injected into every AI system prompt. */
export const MR_SOFTWARE_PLATFORM_OWNER = {
  founderName: "Yafet Tesfaye",
  company: "YafetPromedia",
  handles: ["@yafet", "yafetpromedia"] as const,
  website: "https://yafetpromedia.com",
} as const;

export function buildPlatformFactsBlock(): string {
  const { founderName, company, handles, website } = MR_SOFTWARE_PLATFORM_OWNER;
  return `Authoritative ${PLATFORM_DEFAULTS.name} platform facts (use for ownership, founder, or company questions — never guess or invent other names):
- Platform: ${PLATFORM_DEFAULTS.name}
- Domain: ${PLATFORM_DEFAULTS.domain}
- URL: ${PLATFORM_DEFAULTS.url}
- Founder & owner: ${founderName} (${company})
- Company / organization: ${company}
- Storefront handles: ${handles.join(", ")} (public URLs: ${PLATFORM_DEFAULTS.domain}/@handle)
- YafetPromedia website: ${website}
- Mission: ${PLATFORM_DEFAULTS.mission}`;
}

export const DEFAULT_AI_TEAM: AiTeam = {
  founder: "",
  aiArchitect: BRAND_AI_NAME,
  aiDeveloper: "Cursor",
};

export const EMPTY_CREATOR_DNA: CreatorDna = {};

export const EMPTY_PROFILE: DeveloperProfileJson = {};

/** Flagship demo profile for YafetPromedia — used in seed and as reference defaults. */
export const YAFET_DEMO_PROFILE: DeveloperProfileJson = {
  developer: {
    name: "Yafet Tesfaye",
    handle: "@yafet",
    organization: "YafetPromedia",
    country: "Ethiopia",
    city: "Addis Ababa",
    role: "Founder, Designer, Full-Stack Developer",
    website: "https://yafetpromedia.com",
    email: "yafetpromedia@gmail.com",
  },
  vision: {
    mission:
      "Combine technology, design, education, and entrepreneurship to empower businesses, students, developers, and creators.",
    primaryPlatform: BRAND_NAME,
    company: "YafetPromedia",
  },
  projects: [
    { name: BRAND_NAME, type: "Software Business Ecosystem", status: "Active" },
    { name: "CampusOne", type: "Education SaaS", status: "Active" },
    { name: "YafetPromedia YouTube", type: "Education & Media", status: "Active" },
  ],
  skills: [
    "UI/UX Design",
    "Graphic Design",
    "Full-Stack Development",
    "Video Editing",
    "Digital Marketing",
    "Content Creation",
    "Software Architecture",
  ],
};

export const YAFET_DEMO_CREATOR_DNA: CreatorDna = {
  designStyle: "Modern, minimal, premium, glassmorphism, dark-mode friendly, 3D elements",
  preferredColors: ["Orange", "Orange Gradient"],
  focus: [
    "African startups",
    "SaaS products",
    "Developer tools",
    "Education technology",
    "Creative media",
    "Digital marketing",
  ],
  values: [
    "Innovation",
    "Quality",
    "Creativity",
    "Education",
    "Integrity",
    "Continuous learning",
    "Developer ownership",
    "Open ecosystems",
  ],
};

export const YAFET_DEMO_TEAM: AiTeam = {
  founder: "Yafet Tesfaye",
  aiArchitect: BRAND_AI_NAME,
  aiDeveloper: "Cursor",
};
