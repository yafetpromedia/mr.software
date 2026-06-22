import "dotenv/config";
import bcrypt from "bcrypt";
import { AcademyCourseLevel, Plan, PricingModel, Role, SoftwareCategory, SubscriptionStatus, type DistributionType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { seedDefaultTeamContent } from "../lib/team";
import { ensureAcademyDefaults } from "../lib/academy/academy";
import { seedSampleReports } from "../lib/reports";
import { applyTrustOnSoftwarePublish } from "../lib/trust/publish-trust";
import { seedDeveloperMemoryProfile } from "../lib/ai/developer-memory/profile";
import {
  YAFET_DEMO_CREATOR_DNA,
  YAFET_DEMO_PROFILE,
  YAFET_DEMO_TEAM,
} from "../lib/ai/developer-memory/defaults";

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

  await seedDeveloperMemoryProfile(developer.id, {
    profile: YAFET_DEMO_PROFILE,
    creatorDna: YAFET_DEMO_CREATOR_DNA,
    team: YAFET_DEMO_TEAM,
    currentProjectName: "CampusOne",
    currentProjectCategory: "Education SaaS",
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
    {
      slug: "build-with-mr-software-ai",
      title: "Build with Mr.Software AI",
      description:
        "Use Startup Advisor, Software Architect, Launchpad, and your Developer Memory Profile to go from idea to landing page — with AI that knows who you are.",
      level: AcademyCourseLevel.BEGINNER,
      durationMinutes: 65,
      sortOrder: 4,
      lessons: [
        {
          title: "Mr.Software AI overview",
          summary: "The AI modules inside the platform and when to use each one.",
          durationMinutes: 12,
          sortOrder: 1,
          content: `## Your AI co-pilot stack

Mr.Software AI is built into the workspace — not a separate chatbot. Core modules:

| Module | Best for |
| --- | --- |
| **Startup Advisor** | Validate ideas, pricing, market fit |
| **Software Architect** | Stack, modules, API structure |
| **Launchpad** | Landing pages and SaaS blueprints |
| **Copilot** | Quick questions in the sidebar |
| **Deployment Advisor** | Hosting and go-live strategy |

> Mr.Software AI speaks as the platform — practical SaaS advice, not generic hype.

## Sign in first

All AI routes require an account. Add \`AI_API_KEY\` in your environment for production.

---

Next: run your first idea through Startup Advisor.`,
        },
        {
          title: "Validate with Startup Advisor",
          summary: "Turn a rough idea into problem, solution, features, and pricing.",
          durationMinutes: 15,
          sortOrder: 2,
          content: `## From one sentence to a blueprint

Open **Builder → Startup Advisor** and describe your product in plain language.

Example:

\`\`\`
School management SaaS for private schools in Ethiopia —
attendance, fees, parent portal, report cards.
\`\`\`

The Advisor returns structured JSON:

- Project name and problem statement
- Target users and feature list
- Pricing ideas and business model
- Technical architecture sketch
- Deployment notes

## Save your analysis

Click **Save** to store the conversation. You can revisit it from the builder tab.

> Use Advisor output as input to Architect and Launchpad — don't skip validation.`,
        },
        {
          title: "Plan architecture & landing pages",
          summary: "Software Architect for technical plans; Launchpad for marketing sites.",
          durationMinutes: 18,
          sortOrder: 3,
          content: `## Software Architect

Paste your validated idea (or Advisor summary) into **Software Architect**.

You get:

- Frontend / backend / database recommendations
- Module breakdown
- API structure
- Deployment notes for Mr.Software Cloud

## Launchpad (SaaS Blueprint)

**Launchpad** generates a full landing package:

- Name, tagline, feature bullets
- Hero, showcase, pricing, and CTA sections
- Brand colors and optional 3D visual style

Preview at \`/startup/[id]/dashboard-preview\` before you publish anything.

## Workflow tip

\`\`\`
Idea → Advisor → Architect → Launchpad → Deploy → Marketplace
\`\`\`

Each step builds on the last.`,
        },
        {
          title: "Developer Memory Profile",
          summary: "Teach the AI who you are — design DNA, team identity, current project.",
          durationMinutes: 12,
          sortOrder: 4,
          content: `## Personalized AI context

Go to **Settings → AI Memory** and fill in:

- **Creator profile** — name, org, location, skills
- **Creator DNA** — design style, colors, focus areas
- **AI team** — founder + Mr.Software AI + Cursor attribution
- **Current project** — e.g. CampusOne, Education SaaS

Every AI request automatically receives this as YAML context.

## What stays separate

- **Ownership records** — legal proof when you publish (trust system)
- **License keys** — buyer purchase proof
- **AI Memory** — creative context only

> Set your profile once. Every landing page and architecture plan matches your brand.`,
        },
        {
          title: "Ship your first AI-generated draft",
          summary: "Save, preview, and connect output to deploy and marketplace.",
          durationMinutes: 8,
          sortOrder: 5,
          content: `## End-to-end checklist

1. Complete **AI Memory** in Settings
2. Run **Startup Advisor** on your idea — save
3. Run **Architect** with the same idea
4. Generate a **Launchpad** landing — save
5. Deploy a static preview to Mr.Software Cloud
6. Create a marketplace listing linking demo + download

## Attribution

Generated projects can include:

\`\`\`
Built by: [Your name]
with Mr.Software AI and Cursor
\`\`\`

---

Mark complete and open the **Startup Factory** when you're ready for the full wizard.`,
        },
      ],
    },
    {
      slug: "trust-ownership-licensing",
      title: "Trust, ownership & licensing",
      description:
        "Protect your IP with ownership records, license tiers, verification API, and distribution types — the trust stack for African software businesses.",
      level: AcademyCourseLevel.INTERMEDIATE,
      durationMinutes: 50,
      sortOrder: 5,
      lessons: [
        {
          title: "Why trust matters for founders",
          summary: "Platform records vs patents — what Mr.Software proves for you.",
          durationMinutes: 10,
          sortOrder: 1,
          content: `## You own what you create

Mr.Software hosts and distributes — **you keep IP**. The trust stack gives buyers and partners confidence:

1. **Ownership record** — timestamped proof you published
2. **License keys** — proof of purchase
3. **Verification API** — apps can validate keys at runtime

> Especially valuable for African startups proving authorship and creation date.`,
        },
        {
          title: "Ownership records",
          summary: "MS-OWN numbers, fingerprints, and public certificate pages.",
          durationMinutes: 12,
          sortOrder: 2,
          content: `## Created on publish

When you publish to the marketplace, Mr.Software creates:

- Record number: \`MS-OWN-2026-00001\`
- Public page: \`/trust/ownership/[recordNumber]\`
- Product fingerprint (SHA-256 from developer ID, name, asset, timestamp)

## What it proves

- Who uploaded
- When it was published
- Which product version was registered

## What it does not replace

Government patents or copyright registration — it's a **platform timestamp** for startups and schools.`,
        },
        {
          title: "License tiers & keys",
          summary: "Personal, commercial, enterprise, open source — and MRS-XXXX keys.",
          durationMinutes: 14,
          sortOrder: 3,
          content: `## Choose a tier at publish

| Tier | Typical use |
| --- | --- |
| Personal | Single user, no redistribution |
| Commercial | Business use, unlimited employees |
| Enterprise | Large orgs, custom support |
| Open source | MIT, Apache, GPL, BSD templates |

After purchase, buyers receive \`MRS-XXXX-XXXX-XXXX\` keys.

## Verify from your app

\`\`\`http
POST /api/licenses/verify
{ "licenseKey": "MRS-...", "domain": "school.edu.et" }
\`\`\`

Use domain lock for hosted school or SaaS installs.`,
        },
        {
          title: "Distribution types",
          summary: "Source code vs compiled vs hosted — pick the right model.",
          durationMinutes: 14,
          sortOrder: 4,
          content: `## How buyers receive your product

| Type | Buyer gets | Best for |
| --- | --- | --- |
| SOURCE_CODE | Download | Templates, starter kits |
| COMPILED | Binary + key | Desktop apps |
| HOSTED | Cloud URL only | CampusOne-style SaaS |

**Hosted** blocks source downloads at the API — highest piracy protection, recurring revenue.

## CampusOne model

Sell cloud access (\`school1.mr.software\`), not source code. Updates and support stay under your control.

---

Publish with the right tier + distribution before marketing.`,
        },
      ],
    },
    {
      slug: "saas-factory-go-to-market",
      title: "SaaS factory & go-to-market",
      description:
        "From factory wizard to @handle storefront — package your product, launch publicly, and grow through marketplace discovery.",
      level: AcademyCourseLevel.ADVANCED,
      durationMinutes: 60,
      sortOrder: 6,
      lessons: [
        {
          title: "Startup factory workflow",
          summary: "Idea → validation → package → deploy → storefront in one flow.",
          durationMinutes: 15,
          sortOrder: 1,
          content: `## The factory steps

The **Startup Factory** wizard guides:

1. **Idea** — describe the product
2. **Validation** — Advisor analysis
3. **Package** — landing + blueprint JSON
4. **Deploy** — Cloud preview
5. **Storefront** — connect your @handle

> Factory sessions persist so you can resume across days.`,
        },
        {
          title: "Storefront as your sales hub",
          summary: "Public @handle pages, social links, and featured creator status.",
          durationMinutes: 15,
          sortOrder: 2,
          content: `## Your creator store

Every developer gets \`mr.software/@handle\`:

- Bio, tagline, website, social links
- Theme (Classic, Minimal, Bold, Midnight)
- Product grid and deployment previews
- Optional public revenue display

## Growth tactics

- Claim a memorable handle early
- Feature your flagship product first
- Cross-link Academy certificates and trust records
- Enable follow notifications for launches`,
        },
        {
          title: "Marketplace discovery",
          summary: "Categories, pricing display, and converting browsers to buyers.",
          durationMinutes: 15,
          sortOrder: 3,
          content: `## Get found

Listings appear in **Marketplace** by category:

- Education, Healthcare, Business, AI Tools, Templates, etc.

Optimize for conversion:

- Strong thumbnail and first paragraph
- ETB + USD pricing where relevant
- Live demo button (linked deployment)
- Testimonials from early customers

## Payments

Stripe for global cards; Chapa + Telebirr for Ethiopia. See the **African payments** course for setup.`,
        },
        {
          title: "Launch playbook",
          summary: "Week-one checklist for a credible public launch.",
          durationMinutes: 15,
          sortOrder: 4,
          content: `## Launch week

**Day 1–2**
- Publish listing + ownership record
- Deploy live demo
- Storefront live with bio

**Day 3–4**
- Test purchase (Stripe sandbox + Chapa test)
- Share on social with @handle link
- Submit 2–3 testimonials

**Day 5–7**
- Monitor conversion demo → purchase
- Respond to support within 24h
- Ship v1.0.1 if early feedback needs fixes

## Recurring revenue

Prefer **subscription** or **hosted** models for school and business SaaS.

---

You now have the full learn → build → publish → protect → monetize loop.`,
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
