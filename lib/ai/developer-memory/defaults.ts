import type { AiTeam, CreatorDna, DeveloperProfileJson } from "@/lib/ai/developer-memory/schema";

export const PLATFORM_DEFAULTS = {
  name: "Mr.Software",
  mission: "African software business ecosystem",
} as const;

export const DEFAULT_AI_TEAM: AiTeam = {
  founder: "",
  aiArchitect: "Mr.Software AI",
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
    mission: "Build African software infrastructure and startup ecosystems.",
    primaryPlatform: "Mr.Software",
    company: "YafetPromedia",
  },
  projects: [
    { name: "Mr.Software", type: "Software Business Ecosystem", status: "Active" },
    { name: "CampusOne", type: "Education SaaS", status: "Active" },
  ],
  skills: [
    "UI/UX Design",
    "Graphic Design",
    "Full-Stack Development",
    "Video Editing",
    "Digital Marketing",
  ],
};

export const YAFET_DEMO_CREATOR_DNA: CreatorDna = {
  designStyle: "Modern, futuristic, premium",
  preferredColors: ["Orange", "Orange Gradient"],
  focus: ["African startups", "SaaS products", "Developer tools", "Education technology"],
  values: ["Developer ownership", "Open ecosystems", "AI-assisted development", "Innovation"],
};

export const YAFET_DEMO_TEAM: AiTeam = {
  founder: "Yafet Tesfaye",
  aiArchitect: "Mr.Software AI",
  aiDeveloper: "Cursor",
};
