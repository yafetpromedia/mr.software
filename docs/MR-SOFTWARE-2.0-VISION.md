# Mr.Software 2.0 Vision

**Status:** Strategic north star · **Owner:** YafetPromedia  
**Last updated:** June 2026

**Related:** [Strategic review](./STRATEGIC-REVIEW.md) · [Engineering roadmap](./ROADMAP-2.0.md) · [Technical spec](./PROJECT.md)

---

## Overview

Mr.Software is no longer just a software marketplace or deployment platform.

It becomes a **Software Business Operating System** — the infrastructure layer where African developers **build, launch, deploy, monetize, and scale** software businesses.

### Positioning

> **AI helps you build. You own the system.**

Differentiation: unlike closed AI builders, developers keep their code, deploy path, storefront identity (`/@handle`), and revenue data on Mr.Software.

### Mission

**Build → Deploy → Sell → Manage → Scale** from one platform.

### North star (one line)

> *The platform where African developers turn software into businesses.*

Mr.Software is a product ecosystem owned by **YafetPromedia**. Products such as CampusOne, future SaaS applications, templates, APIs, and digital solutions can all be published and monetized through Mr.Software.

### Strategic shift

| Mr.Software 1.x | Mr.Software 2.0 (target) |
|-------------------|---------------------------|
| Marketplace + deploy + auth | **Continent-wide startup creation ecosystem** |
| Upload → sell | **Startup Factory:** idea → validation → build → deploy → launch → revenue |
| Product-centric URLs | **Developer storefronts** at `/@handle` (identity layer) |
| Stripe-only payments | African + global payment rails |
| Isolated AI tools | **AI startup team** + co-pilot across lifecycle |
| Academy placeholder | Learn → build → publish loop (**shipped**) |

The goal is **not** to beat GitHub, Vercel, or Stripe individually. The goal is to **unify everything software entrepreneurs need** into one platform built for Africa and the world.

**Strongest asset:** every developer gets a storefront, AI tools, deployment infrastructure, and monetization in **one ecosystem** — not four separate products.

---

## Core platform architecture

### 1. Mr.Software Marketplace (core product)

The marketplace is the center of the ecosystem.

**Sell:**

- SaaS products
- Website templates
- Mobile applications
- UI kits
- APIs
- Digital products
- Source code

**Each product receives:**

- Product page
- Demo page
- Documentation page
- Reviews
- Analytics
- Sales reports
- Version history

**Categories (target):**

Education · Healthcare · Business · Finance · E-Commerce · Government · AI Tools · Developer Tools · Templates · APIs

**Today:** Public catalog, detail pages, Stripe checkout, entitlements, signed downloads.  
**Next:** Categories, reviews, version history, demo/docs tabs per product.

---

### 2. Mr.Software Cloud

Every product can be deployed directly from the platform.

**Features:**

- Frontend deployment
- Static hosting
- Custom domains
- SSL certificates
- Deployment analytics
- Deployment history
- Team collaboration

**Deployment flow:**

```text
Upload Project → Build → Deploy → Generate URL → Publish to Marketplace
```

No external hosting required.

**Today:** ZIP deploy, **GitHub OAuth deploy** (`/deploy?source=github`), slugged URLs, local/S3 storage, preview API, deployment status lifecycle.  
**Next:** GitHub-first factory onboarding, custom domains, SSL, deploy → marketplace publish in one flow.

---

### 3. Creator Dashboard

Every developer receives a business dashboard.

**Features:**

- Revenue tracking
- Product management
- Customer management
- Orders
- Downloads
- Analytics
- Subscription management
- Team members

This transforms developers into business owners.

**Today:** Developer workspace — listings, earnings, payouts, deploy, projects, builder.  
**Next:** Customer CRM, order history, team seats, unified analytics.

---

### 4. Mr.Software Payments

African-friendly payment infrastructure.

**Support (target):**

- Telebirr
- Chapa
- Commercial Bank gateways
- Stripe
- PayPal

**Features:**

- One-time payments
- Monthly subscriptions
- Product licenses
- Revenue sharing
- Developer payouts

**Today:** Stripe Checkout, webhooks, purchase entitlements, dev checkout grant.  
**Next:** Chapa/Telebirr integration, ETB payouts, revenue split rules.

---

### 5. Mr.Software AI

AI assists — **does not replace** developers.

**AI features (target):**

- Product description generation
- Documentation generation
- Landing page generation
- Market analysis
- Startup validation
- UI suggestions
- Code review assistance

AI is a **co-pilot**, not an automatic startup generator.

**Today:** Startup advisor (LLM when configured), rule-based + saved builder, copilot panel shell.  
**Next:** **Startup Factory** wizard chaining advisor → builder → deploy → listing; **AI startup team** personas (`lib/ai/startup-team.ts`).

---

### 6. Mr.Software Academy

Learning ecosystem.

**Features:**

- Development courses
- SaaS building guides
- Business courses
- Deployment tutorials
- Marketplace success guides

Students learn and immediately publish products on Mr.Software.

**Today:** Admin CMS (`/admin/academy`), public catalog, course pages, progress tracking.  
**Next:** Publish-from-lesson workflow tied to Startup Factory.

---

## Four north star systems (2.0)

These systems turn Mr.Software from “marketplace + hosting” into a **startup creation ecosystem**. Full phased plan: [`ROADMAP-2.0.md`](./ROADMAP-2.0.md).

### 1. Startup Factory

**Target flow:**

```text
Idea → AI Validation → AI Builder → Deploy → Launch → Marketplace → Revenue
```

Users should **create startups inside Mr.Software**, not only upload ZIPs. Individual steps exist today; Phase A wires them into one guided factory.

### 2. Global infrastructure map

**Story:** Projects emerge from Africa and connect globally.

```text
Addis Ababa  → CampusOne
Nairobi      → Fintech App
Lagos        → Ecommerce Platform
Cairo        → Healthcare SaaS
```

**Today:** Full-viewport Africa → World globe on logged-out homepage (`components/landing/africa-launch/`), demo arcs and CampusOne narrative in `lib/landing/africa-hero-data.ts`.  
**Next:** Live feed from real deployments and listings on the map.

### 3. One-click GitHub deployment

```text
Connect GitHub → Select repository → Deploy → mr.software/…
```

**Today:** OAuth, repo picker, and deploy API shipped; Deployment Center UI at `/deploy`.  
**Next:** Default path in Startup Factory; post-deploy listing draft.

### 4. AI startup team

```text
Human Founder + Mr Strategist + Mr Designer + Mr Developer + Mr Marketer
```

Every startup gets a **named AI team** — unique vs a single generic chatbot. Role definitions: `lib/ai/startup-team.ts`. Strategist-like output exists via startup advisor; designer/marketer outputs are Phase D.

---

## Flagship products (YafetPromedia)

Products built by YafetPromedia demonstrate the ecosystem:

| Product | Category | Description |
|---------|----------|-------------|
| **CampusOne** | Education | School management SaaS |
| **ClinicPro** | Healthcare | Healthcare management SaaS |
| **BusinessFlow** | Business | Business ERP SaaS |

These become **featured products** inside the marketplace and on flagship developer storefronts.

---

## Developer Storefront System (priority upgrade)

The single architectural change that turns Mr.Software from a marketplace into an **ecosystem**.

### Model

```text
Developer Profile
   ↓
Developer Store (@handle)
   ↓
Products
   ↓
Subscriptions
   ↓
Customers
```

### Public URLs

```text
mr.software/@yafetpromedia
mr.software/@teenteamsolution
mr.software/@ismael
```

Each storefront includes:

- Branded profile (name, tagline, bio, website)
- Product catalog (developer's listings only)
- Stats (product count; reviews/followers in later phases)
- Link from every product page back to the store

### Implementation phases

| Phase | Scope | Status |
|-------|--------|--------|
| **Phase 1** | `DeveloperStorefront` model, `/@handle` public page, settings UI, product links | **Shipped** |
| **Phase 2** | Categories, featured stores, Chapa/Telebirr, followers, analytics, Academy MVP | **Shipped** |
| **Phase 3** | Custom storefront themes, verified badges, revenue public stats | **Shipped** |
| **Phase 4** | Subscriptions sold at store level, customer portal per store | Planned |

### Data model (Phase 1)

```prisma
model DeveloperStorefront {
  userId    String   @id
  handle    String   @unique   // e.g. yafetpromedia
  tagline   String?
  bio       String?
  website   String?
  featured  Boolean  @default(false)
  ...
}
```

### Reserved handles

`admin`, `api`, `app`, `auth`, `marketplace`, `software`, `deploy`, `settings`, `startup`, `www`, etc.

---

## Long-term vision

Mr.Software becomes **Africa's largest software ecosystem** where developers can build, deploy, sell, and scale software products without needing multiple platforms.

### Success metrics (2.0)

- Active developer storefronts
- GMV through marketplace + subscriptions
- Deployments published to marketplace
- African payment volume (ETB + mobile money)
- Academy → publish conversion rate

### What we deliberately do not build first

- Competing with Git as source of truth
- Full IDE in the browser
- Generic social network features unrelated to software business

---

## Mapping to current codebase

| Vision pillar | Primary routes / modules today |
|---------------|-------------------------------|
| Marketplace | `/marketplace`, `/app/marketplace`, `/software/[id]`, Stripe, entitlements |
| Cloud | `/deploy`, GitHub OAuth (`/api/github/*`), `/projects`, `/api/deploy` |
| Creator dashboard | `/app`, `/listings`, `/earnings`, `/payouts`, `/app/storefront` |
| Payments | Stripe webhooks, `/api/checkout`, Chapa hooks (where configured) |
| AI / Factory | `/app/ai`, `/app/builder`, `/api/ai/startup-advisor`, `/api/generate-startup` |
| AI team (spec) | `lib/ai/startup-team.ts` |
| Academy | `/academy`, `/admin/academy`, course progress |
| Storefronts | `/@handle`, social links, themes, verified badge, `lib/storefront/` |
| Developer access | `/app/settings#developer`, `/admin/developer-requests` |
| Trust & map | Africa globe hero, partners CMS, testimonials, team CMS |
| Reports | `/api/reports`, `/admin/reports` |

See also: [`PROJECT.md`](./PROJECT.md) · [`USER-ADMIN-GUIDE.md`](./USER-ADMIN-GUIDE.md) · [`STRATEGIC-REVIEW.md`](./STRATEGIC-REVIEW.md).

---

## Cursor / engineering principles (2.0)

1. **Platform before pages** — every feature should strengthen the Build → Deploy → Sell → Manage → Scale loop.
2. **Developer as business owner** — optimize for storefront identity, not anonymous listings.
3. **Africa-first payments** — design entitlement and payout models for local rails early.
4. **AI as co-pilot** — assist at listing, docs, and deploy steps; never black-box the product.
5. **Ship phases** — storefront Phase 1 before followers, themes, or store-level billing.
