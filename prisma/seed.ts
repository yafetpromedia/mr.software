import "dotenv/config";
import bcrypt from "bcrypt";
import { AcademyCourseLevel, Plan, PricingModel, Role, SoftwareCategory, SubscriptionStatus, type DistributionType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { seedDefaultTeamContent } from "../lib/team";
import { ensureAcademyDefaults } from "../lib/academy/academy";
import { seedSampleReports } from "../lib/reports";
import { applyTrustOnSoftwarePublish } from "../lib/trust/publish-trust";

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
  distributionType?: DistributionType;
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
    distributionType: "SOURCE_CODE",
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
    distributionType: "COMPILED",
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
    distributionType: "HOSTED",
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
    distributionType: "COMPILED",
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

  const admin = await prisma.user.upsert({
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
        distributionType: c.distributionType ?? "COMPILED",
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
        distributionType: c.distributionType ?? "COMPILED",
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
        "A complete beginner track: set up your developer profile, create a storefront, list software on the marketplace, and configure pricing that converts.",
      level: AcademyCourseLevel.BEGINNER,
      durationMinutes: 90,
      sortOrder: 1,
      lessons: [
        {
          title: "What is the Mr.Software marketplace?",
          summary: "Understand the platform loop: learn, build, list, and sell.",
          durationMinutes: 12,
          sortOrder: 1,
          content: `## The learn → build → publish loop

Mr.Software is a **software business OS** for developers and founders. You can ship products, host demos, accept payments, and grow an audience — all from one account.

> Your goal in this course: go from zero to a live marketplace listing with a branded storefront.

## What you get when you publish

- A **catalog page** with title, description, screenshots, and pricing
- **Secure downloads** — buyers never see raw asset URLs
- Optional **Stripe** or **Chapa** checkout for global and local payments
- A **storefront** at \`/@yourname\` to showcase your work

## Before you start

1. Create a developer account (or upgrade from a user account)
2. Verify your email
3. Open **Developer Settings** from the app menu

---

Next we'll walk through creating your storefront and first listing step by step.`,
        },
        {
          title: "Create your developer storefront",
          summary: "Claim your handle and customize your public profile page.",
          durationMinutes: 15,
          sortOrder: 2,
          content: `## Your storefront is your home base

Every developer gets a public page at \`/@handle\`. This is where followers discover your products, bio, and links.

## Step-by-step

1. Go to **Settings → Developer**
2. Choose a unique **handle** (lowercase, no spaces)
3. Add a short **bio** and optional avatar
4. Save — your page is live immediately

## Best practices

- Use a handle that matches your brand or GitHub username
- Write a bio that states **who you help** and **what you ship**
- Link to your best product first

\`\`\`
Example bio:
"I build AI tools and templates for African founders.
Ship faster with my starter kits."
\`\`\`

> Tip: Share your storefront link on X, LinkedIn, and in your product README.`,
        },
        {
          title: "List your first software product",
          summary: "Upload assets, pick a category, and write a listing that sells.",
          durationMinutes: 20,
          sortOrder: 3,
          content: `## Creating a marketplace listing

From the developer portal, open **Software → New listing**.

### Required fields

- **Name** — clear, searchable (e.g. "SaaS Landing Page Kit")
- **Description** — explain the outcome, not just features
- **Category** — Education, AI Tools, Templates, DevOps, etc.
- **Asset** — ZIP or package buyers will download

### Writing a strong description

Structure your copy in three parts:

1. **Problem** — what pain does this solve?
2. **Solution** — what does the buyer get?
3. **Proof** — screenshots, version, changelog

## Categories that perform well

- Starter templates and boilerplates
- AI workflow packs
- Niche tools for local markets (payments, languages, compliance)

---

After saving as **draft**, preview the listing. Publish when you're ready for it to appear on /marketplace.`,
        },
        {
          title: "Pricing models that work",
          summary: "One-time vs subscription, free tiers, and regional pricing tips.",
          durationMinutes: 18,
          sortOrder: 4,
          content: `## Choose the right pricing model

Mr.Software supports **one-time** and **subscription** pricing.

| Model | Best for |
| --- | --- |
| One-time | Templates, ebooks, single tools |
| Subscription | SaaS, updates, support included |

## Setting your price

- Start with a **launch price** lower than your target — you can raise later
- For ETB markets, round to familiar price points (499, 999, 1999 ETB)
- Offer a **free product** first to collect emails and testimonials

## Stripe vs Chapa

- **Stripe** — cards, global buyers, USD/EUR
- **Chapa** — ETB, mobile money (Telebirr), local cards

> You can enable both. Checkout picks the right flow based on configuration.

## Checklist before launch

- [ ] Price set and tested in sandbox
- [ ] Screenshot and cover image uploaded
- [ ] License terms clear in description
- [ ] Support contact in bio or listing`,
        },
        {
          title: "Launch checklist & next steps",
          summary: "Ship with confidence — verify checkout, analytics, and promotion.",
          durationMinutes: 15,
          sortOrder: 5,
          content: `## Pre-launch verification

Run through this list before sharing your link publicly:

1. **Purchase test** — buy your own product with a test card or sandbox Chapa
2. **Download test** — confirm the entitlement and download token flow
3. **Storefront** — confirm the product appears on \`/@handle\`
4. **Mobile** — check listing on a phone

## Promote your launch

- Post on your storefront-linked social accounts
- Ask 3 peers for **testimonials** (they can submit from the landing page)
- Cross-link from your GitHub repo README

## What to learn next

- **Deploy & monetize** — host a live demo on Mr.Software Cloud
- **African payments** — deep dive on Chapa and Telebirr

---

**Congratulations** — you're ready to publish. Mark this course complete and open the builder when you want to ship something new.`,
        },
      ],
    },
    {
      slug: "deploy-and-monetize",
      title: "Deploy & monetize",
      description:
        "Ship static sites and demos to Mr.Software Cloud, tie deployments to marketplace listings, and understand entitlements end-to-end.",
      level: AcademyCourseLevel.INTERMEDIATE,
      durationMinutes: 75,
      sortOrder: 2,
      lessons: [
        {
          title: "Deployment architecture",
          summary: "How ZIP uploads become live URLs on the platform.",
          durationMinutes: 15,
          sortOrder: 1,
          content: `## From ZIP to live URL

Mr.Software Cloud turns a static build into a hosted demo:

\`\`\`
Your build.zip → upload → build pipeline → https://your-app.mrsoftware.cloud
\`\`\`

## When to deploy

- **Product demos** linked from marketplace listings
- **Client previews** before handoff
- **Documentation sites** for your templates

## Limits & expectations

- Static sites and SPA builds work best
- Server-side backends need separate hosting
- Each deployment gets a unique URL you can rotate

> Deployments can be linked to a **software row** so buyers preview before purchase.`,
        },
        {
          title: "Upload and configure a deployment",
          summary: "Step-by-step deploy flow from the developer dashboard.",
          durationMinutes: 20,
          sortOrder: 2,
          content: `## Deploy step-by-step

1. Build your project locally (\`npm run build\`)
2. ZIP the output folder (e.g. \`dist/\` or \`out/\`)
3. Open **Deployments → New**
4. Upload ZIP, name the deployment, optionally link to software
5. Wait for build — status moves from **pending** to **live**

## Linking to a listing

When linked, your marketplace page shows a **Live demo** button. This increases conversion for visual products.

## Troubleshooting

- **Build failed** — check index.html exists at ZIP root or correct subfolder
- **Blank page** — SPA may need base path config
- **Slow first load** — large assets; optimize images before zipping`,
        },
        {
          title: "Entitlements & license flow",
          summary: "How purchases become download rights for your customers.",
          durationMinutes: 18,
          sortOrder: 3,
          content: `## Purchase → license → download

When a customer pays:

1. Payment provider confirms via webhook
2. A **license row** is created for that user + product
3. Download uses a **short-lived token** — never a public S3 URL

## Why this matters

- Prevents link sharing and piracy
- Lets you revoke access if needed
- Works the same for Stripe and Chapa

## Developer responsibilities

- Keep asset URLs private in your env config
- Version your ZIPs — bump version in listing when you ship updates
- Subscribers may expect automatic access to new versions`,
        },
        {
          title: "Monetization playbook",
          summary: "Bundle demos, listings, and email capture for maximum revenue.",
          durationMinutes: 22,
          sortOrder: 4,
          content: `## The demo + download combo

Best-performing listings use:

- **Live demo** on Cloud (try before buy)
- **Clear pricing** above the fold
- **Testimonials** on your storefront

## Funnel ideas

1. Free template → paid pro version
2. Demo site → one-time unlock for source code
3. Subscription → monthly new templates

## Metrics to watch

- Demo → purchase conversion
- Refund / support requests
- Traffic sources (storefront vs marketplace search)

---

Ship your next deployment, link it to a listing, and track what converts.`,
        },
      ],
    },
    {
      slug: "african-payments",
      title: "African payments (Chapa & Telebirr)",
      description:
        "Accept ETB, mobile money, and local cards alongside Stripe — configuration, checkout flow, webhooks, and buyer experience.",
      level: AcademyCourseLevel.BEGINNER,
      durationMinutes: 55,
      sortOrder: 3,
      lessons: [
        {
          title: "Why local payments matter",
          summary: "Reach Ethiopian and African buyers who don't use international cards.",
          durationMinutes: 10,
          sortOrder: 1,
          content: `## The gap Stripe doesn't fill

Many of your customers use **Telebirr**, **CBE Birr**, or local debit — not Visa/Mastercard.

Mr.Software integrates **Chapa** so you can accept:

- ETB settlements
- Mobile money (including Telebirr via Chapa)
- Local bank cards

> Enabling local payments often **doubles conversion** for ETB-priced products.`,
        },
        {
          title: "Configure Chapa",
          summary: "Environment keys, webhook URL, and sandbox testing.",
          durationMinutes: 18,
          sortOrder: 2,
          content: `## Setup checklist

1. Create a [Chapa](https://chapa.co) merchant account
2. Copy **CHAPA_SECRET_KEY** into your environment
3. Set webhook URL to your app's \`/api/webhooks/chapa\` endpoint
4. Enable Chapa in admin/system payment settings

## Sandbox vs production

- Use test keys while developing
- Run a real small-amount purchase before launch
- Confirm webhook fires and license activates

\`\`\`
# .env example
CHAPA_SECRET_KEY=CHASECK_TEST-...
\`\`\`

## Common errors

- **Invalid key** — test vs live mismatch
- **Webhook 401** — verify signature secret
- **Amount mismatch** — ETB must be integer birr`,
        },
        {
          title: "Telebirr via Chapa checkout",
          summary: "How buyers pay with mobile money on the hosted checkout page.",
          durationMinutes: 12,
          sortOrder: 3,
          content: `## Telebirr flow

Telebirr is offered **through Chapa's hosted checkout** — you don't integrate Telebirr separately.

1. Buyer clicks **Buy** on your listing
2. Redirected to Chapa checkout
3. Selects **Telebirr** or mobile money option
4. Completes payment on phone
5. Webhook confirms → license granted

## Configuration

- \`ENABLE_TELEBIRR\` defaults to true — set false only to hide the option
- Price must be in **ETB** for local methods

> Show ETB pricing clearly on your listing so buyers know what they'll pay.`,
        },
        {
          title: "Stripe + Chapa together",
          summary: "Offer global and local checkout without confusing buyers.",
          durationMinutes: 15,
          sortOrder: 4,
          content: `## Dual payment strategy

| Buyer | Typical method |
| --- | --- |
| International | Stripe (USD card) |
| Ethiopia | Chapa (ETB, Telebirr) |

## Pricing display tips

- Show **both currencies** if you support both, e.g. "$19 / 1,099 ETB"
- Or create separate listings per region if pricing differs

## Reconciliation

- Stripe dashboard for USD/EUR
- Chapa dashboard for ETB settlements
- Mr.Software admin **Payments** tab for unified order view

---

You're ready to accept African payments. Test both flows and publish your listing.`,
        },
      ],
    },
  ] as const;

  await ensureAcademyDefaults();

  for (const course of academyCourses) {
    const row = await prisma.academyCourse.upsert({
      where: { slug: course.slug },
      create: {
        slug: course.slug,
        title: course.title,
        description: course.description,
        level: course.level,
        durationMinutes: course.durationMinutes,
        sortOrder: course.sortOrder,
        published: true,
        lessons: {
          create: course.lessons.map((l) => ({
            title: l.title,
            summary: l.summary,
            content: l.content,
            durationMinutes: l.durationMinutes,
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
        published: true,
      },
    });

    for (const lesson of course.lessons) {
      const existing = await prisma.academyLesson.findFirst({
        where: { courseId: row.id, sortOrder: lesson.sortOrder },
      });
      if (existing) {
        await prisma.academyLesson.update({
          where: { id: existing.id },
          data: {
            title: lesson.title,
            summary: lesson.summary,
            content: lesson.content,
            durationMinutes: lesson.durationMinutes,
          },
        });
      } else {
        await prisma.academyLesson.create({
          data: {
            courseId: row.id,
            title: lesson.title,
            summary: lesson.summary,
            content: lesson.content,
            durationMinutes: lesson.durationMinutes,
            sortOrder: lesson.sortOrder,
          },
        });
      }
    }
  }

  await seedDefaultTeamContent();
  await seedSampleReports(admin.id);

  const needsTrust = await prisma.software.findMany({
    where: { ownershipRecord: null },
    include: { developer: { select: { name: true } } },
  });
  for (const row of needsTrust) {
    await applyTrustOnSoftwarePublish({
      softwareId: row.id,
      developerId: row.developerId,
      developerName: row.developer.name,
      name: row.name,
      description: row.description,
      assetUrl: row.assetUrl,
      licenseTier: row.licenseTier,
      openSourceLicense: row.openSourceLicense,
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
