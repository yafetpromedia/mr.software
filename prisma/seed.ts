import "dotenv/config";
import bcrypt from "bcrypt";
import { AcademyCourseLevel, Plan, PricingModel, Role, SoftwareCategory, SubscriptionStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

const DEMO_PASSWORD = "password123";

type CatalogRow = {
  name: string;
  description: string;
  price: string;
  pricingModel: PricingModel;
  priceCents: number;
  assetUrl: string;
  thumbnailUrl: string;
  category: SoftwareCategory;
  playStoreUrl?: string;
  appStoreUrl?: string;
};

const catalog: CatalogRow[] = [
  {
    name: "AI Writer Pro",
    description:
      "AI tool for content generation\n\nGenerate blog posts, emails, and marketing copy with context-aware AI. Includes tone controls, SEO suggestions, and team workspaces.",
    price: "Free",
    pricingModel: PricingModel.FREE,
    priceCents: 0,
    assetUrl: "https://example.com/downloads/ai-writer-pro",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=675&fit=crop&q=80&auto=format",
    category: SoftwareCategory.AI_TOOLS,
  },
  {
    name: "Design Studio",
    description:
      "Graphic design toolkit for professionals\n\nVector editing, brand kits, and export presets in one place. Collaborate in real time and ship assets that match your design system.",
    price: "$9.99",
    pricingModel: PricingModel.ONE_TIME,
    priceCents: 999,
    assetUrl: "https://example.com/downloads/design-studio",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=675&fit=crop&q=80&auto=format",
    category: SoftwareCategory.TEMPLATES,
  },
  {
    name: "Code Metrics",
    description:
      "Engineering analytics for growing teams\n\nConnect your repos and get DORA-style insights, review turnaround, and release health.",
    price: "$29/mo",
    pricingModel: PricingModel.SUBSCRIPTION,
    priceCents: 2900,
    assetUrl: "https://example.com/downloads/code-metrics",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=675&fit=crop&q=80&auto=format",
    category: SoftwareCategory.DEVELOPER_TOOLS,
  },
  {
    name: "SecureVault",
    description:
      "Passwords and secrets for teams\n\nZero-knowledge architecture with SSO, audit trails, and granular sharing.",
    price: "Free",
    pricingModel: PricingModel.FREE,
    priceCents: 0,
    assetUrl: "https://example.com/downloads/securevault",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=675&fit=crop&q=80&auto=format",
    category: SoftwareCategory.BUSINESS,
  },
  {
    name: "Flow CRM",
    description:
      "Lightweight CRM for small businesses\n\nPipelines, email sequences, and reporting without the enterprise bloat.",
    price: "$19/mo",
    pricingModel: PricingModel.SUBSCRIPTION,
    priceCents: 1900,
    assetUrl: "https://example.com/downloads/flow-crm",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=675&fit=crop&q=80&auto=format",
    category: SoftwareCategory.BUSINESS,
  },
  {
    name: "ClipForge",
    description:
      "Screen recording and lightweight editing\n\nRecord, trim, and share in minutes. Automatic captions and instant share links. Available on web, Google Play, and the App Store.",
    price: "$12.99",
    pricingModel: PricingModel.ONE_TIME,
    priceCents: 1299,
    assetUrl: "https://example.com/downloads/clipforge",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1200&h=675&fit=crop&q=80&auto=format",
    category: SoftwareCategory.DEVELOPER_TOOLS,
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.example.clipforge",
    appStoreUrl: "https://apps.apple.com/app/clipforge/id0000000000",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: "mock.user@mrsoftware.local" },
    create: {
      name: "Mock User",
      email: "mock.user@mrsoftware.local",
      password: passwordHash,
      role: Role.USER,
    },
    update: { password: passwordHash },
  });

  const developer = await prisma.user.upsert({
    where: { email: "dev@mrsoftware.local" },
    create: {
      name: "Dev Studio",
      email: "dev@mrsoftware.local",
      password: passwordHash,
      role: Role.DEVELOPER,
    },
    update: { password: passwordHash },
  });

  await prisma.user.upsert({
    where: { email: "admin@mrsoftware.local" },
    create: {
      name: "Platform Admin",
      email: "admin@mrsoftware.local",
      password: passwordHash,
      role: Role.ADMIN,
    },
    update: { password: passwordHash },
  });

  const existing = await prisma.software.count();
  if (existing === 0) {
    await prisma.software.createMany({
      data: catalog.map((c) => ({
        name: c.name,
        description: c.description,
        price: c.price,
        pricingModel: c.pricingModel,
        priceCents: c.priceCents,
        currency: "usd",
        assetUrl: c.assetUrl,
        thumbnailUrl: c.thumbnailUrl,
        developerId: developer.id,
        category: c.category,
        playStoreUrl: c.playStoreUrl ?? null,
        appStoreUrl: c.appStoreUrl ?? null,
      })),
    });
  }

  for (const c of catalog) {
    await prisma.software.updateMany({
      where: { name: c.name },
      data: {
        thumbnailUrl: c.thumbnailUrl,
        pricingModel: c.pricingModel,
        priceCents: c.priceCents,
        assetUrl: c.assetUrl,
        price: c.price,
        category: c.category,
        playStoreUrl: c.playStoreUrl ?? null,
        appStoreUrl: c.appStoreUrl ?? null,
      },
    });
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  for (const u of users) {
    await prisma.subscription.upsert({
      where: { userId: u.id },
      create: {
        userId: u.id,
        plan: Plan.FREE,
        status: SubscriptionStatus.ACTIVE,
      },
      update: {},
    });
  }

  await prisma.developerStorefront.upsert({
    where: { userId: developer.id },
    create: {
      userId: developer.id,
      handle: "devstudio",
      tagline: "Demo developer storefront on Mr.Software",
      bio: "Sample products for the marketplace catalog. Claim your own handle in Settings.",
      theme: "BOLD",
      verified: true,
      verifiedAt: new Date(),
      featured: true,
    },
    update: {
      tagline: "Demo developer storefront on Mr.Software",
      theme: "BOLD",
      verified: true,
      verifiedAt: new Date(),
      featured: true,
    },
  });

  const academyCourses = [
    {
      slug: "publish-your-first-product",
      title: "Publish your first product",
      description:
        "List software on the Mr.Software marketplace, set pricing, and open your developer storefront.",
      level: AcademyCourseLevel.BEGINNER,
      durationMinutes: 45,
      sortOrder: 1,
      lessons: [
        {
          title: "Marketplace basics",
          content:
            "Mr.Software is a software business OS. Your product gets a catalog page, secure downloads, and optional Stripe or Chapa checkout.\n\nStart from Developer Settings → create your storefront at /@yourname.",
          sortOrder: 1,
        },
        {
          title: "List and price",
          content:
            "Upload via the developer portal or API. Choose a category (Education, AI Tools, Templates, etc.) and set one-time or subscription pricing.",
          sortOrder: 2,
        },
      ],
    },
    {
      slug: "deploy-and-monetize",
      title: "Deploy & monetize",
      description: "Ship a static build to Mr.Software Cloud and link it to your marketplace listing.",
      level: AcademyCourseLevel.INTERMEDIATE,
      durationMinutes: 60,
      sortOrder: 2,
      lessons: [
        {
          title: "Deploy flow",
          content:
            "ZIP upload → build → live URL. Deployments can be tied to a software row for demos and customer previews.",
          sortOrder: 1,
        },
        {
          title: "Entitlements",
          content:
            "Purchases create license rows per user. Downloads use short-lived tokens — assets are never public URLs.",
          sortOrder: 2,
        },
      ],
    },
    {
      slug: "african-payments",
      title: "African payments (Chapa & Telebirr)",
      description: "Accept ETB and mobile money alongside Stripe for one-time product sales.",
      level: AcademyCourseLevel.BEGINNER,
      durationMinutes: 30,
      sortOrder: 3,
      lessons: [
        {
          title: "Configure Chapa",
          content:
            "Set CHAPA_SECRET_KEY in your environment. Checkout initializes a Chapa session; webhooks verify and activate licenses.",
          sortOrder: 1,
        },
        {
          title: "Telebirr via Chapa",
          content:
            "Telebirr is offered through Chapa checkout when ENABLE_TELEBIRR is not false. Customers pick mobile money on the Chapa hosted page.",
          sortOrder: 2,
        },
      ],
    },
  ] as const;

  for (const course of academyCourses) {
    await prisma.academyCourse.upsert({
      where: { slug: course.slug },
      create: {
        slug: course.slug,
        title: course.title,
        description: course.description,
        level: course.level,
        durationMinutes: course.durationMinutes,
        sortOrder: course.sortOrder,
        lessons: {
          create: course.lessons.map((l) => ({
            title: l.title,
            content: l.content,
            sortOrder: l.sortOrder,
          })),
        },
      },
      update: {
        title: course.title,
        description: course.description,
        level: course.level,
        durationMinutes: course.durationMinutes,
        sortOrder: course.sortOrder,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
