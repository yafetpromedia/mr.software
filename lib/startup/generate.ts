import type { GeneratedStartupPayload } from "./types";

const VERTICALS: {
  keywords: RegExp;
  name: string;
  tagline: string;
  features: string[];
  brandLabel: string;
  hue: number;
}[] = [
  {
    keywords: /fitness|workout|gym|health|tracker/i,
    name: "FitNova",
    tagline: "AI-powered fitness tracking for modern athletes",
    features: [
      "AI workout plans tailored to your goals",
      "Progress tracking with smart insights",
      "Nutrition sync and recovery scoring",
      "Community challenges and leaderboards",
    ],
    brandLabel: "Fitness",
    hue: 24,
  },
  {
    keywords: /finance|budget|money|invoice|accounting/i,
    name: "LedgerFlow",
    tagline: "Simple financial clarity for growing teams",
    features: [
      "Real-time cash flow dashboards",
      "Automated expense categorization",
      "Invoice generation in one click",
      "Forecasting powered by AI",
    ],
    brandLabel: "Finance",
    hue: 32,
  },
  {
    keywords: /education|course|learn|tutor|school/i,
    name: "LearnPulse",
    tagline: "Personalized learning paths that adapt to you",
    features: [
      "AI-curated lesson sequences",
      "Interactive quizzes and progress maps",
      "Instructor analytics dashboard",
      "Certificates and skill badges",
    ],
    brandLabel: "EdTech",
    hue: 18,
  },
  {
    keywords: /crm|sales|lead|customer/i,
    name: "PipelineOS",
    tagline: "Close deals faster with an AI-native CRM",
    features: [
      "Smart lead scoring and routing",
      "Automated follow-up sequences",
      "Pipeline forecasting",
      "Unified inbox for every channel",
    ],
    brandLabel: "SaaS",
    hue: 28,
  },
];

const DEFAULT_VERTICAL = {
  name: "LaunchKit",
  tagline: "Ship your idea as a real product in minutes",
  features: [
    "AI-generated positioning and messaging",
    "Conversion-focused landing pages",
    "Pricing and packaging suggestions",
    "Dashboard preview for your MVP",
  ],
  brandLabel: "Startup",
  hue: 26,
};

function pickVertical(idea: string) {
  return VERTICALS.find((v) => v.keywords.test(idea)) ?? DEFAULT_VERTICAL;
}

function titleCaseWord(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function nameFromIdea(idea: string, fallback: string): string {
  const words = idea
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !/^(app|saas|platform|startup|the|for|and)$/i.test(w))
    .slice(0, 2);
  if (words.length === 0) return fallback;
  return words.map(titleCaseWord).join("") + (words.length === 1 ? "Hub" : "");
}

/**
 * MVP generator: deterministic structured output from the idea.
 * Swap for LLM when OPENAI_API_KEY (or similar) is configured.
 */
export function generateStartupFromIdea(idea: string): GeneratedStartupPayload {
  const vertical = pickVertical(idea);
  const name = vertical === DEFAULT_VERTICAL ? nameFromIdea(idea, vertical.name) : vertical.name;

  const pricing = [
    {
      name: "Starter",
      price: "Free",
      description: "Core features to validate your idea",
    },
    {
      name: "Pro",
      price: "$9/mo",
      description: "Advanced AI tools and analytics",
      highlighted: true,
    },
    {
      name: "Team",
      price: "$29/mo",
      description: "Collaboration and priority support",
    },
  ];

  const landingSections: GeneratedStartupPayload["landingSections"] = [
    {
      type: "hero",
      headline: name,
      subheadline: vertical.tagline,
      cta: "Start free trial",
    },
    {
      type: "features",
      title: "Everything you need to launch",
      items: vertical.features,
    },
    {
      type: "pricing",
      title: "Simple, transparent pricing",
      plans: pricing,
    },
    {
      type: "cta",
      title: "Ready to launch?",
      subtitle: `Join teams building with ${name}. AI-assisted draft — review and own your launch.`,
      button: "Get started",
    },
  ];

  return {
    name,
    tagline: vertical.tagline,
    features: vertical.features,
    pricing,
    landingSections,
    brand: {
      primaryHue: vertical.hue,
      label: vertical.brandLabel,
    },
  };
}
