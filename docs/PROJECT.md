# Mr.Software — full project documentation

This document describes **what Mr.Software is**, **what the codebase implements today**, and **how to run and extend it**. Use it as the single source of truth for routes, auth, data, UI surfaces, APIs, branding, and local development.

**Also read:** [`MVP-LAUNCH-PLAN.md`](./MVP-LAUNCH-PLAN.md) for launch priorities (ship MVP before new features). [`USER-ADMIN-GUIDE.md`](./USER-ADMIN-GUIDE.md) for step-by-step flows.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Prisma 7 + PostgreSQL, JWT sessions (`jose`), bcrypt, Stripe, Framer Motion, optional S3 for deploy storage.

---

## Table of contents

1. [Product positioning](#1-product-positioning)
2. [What is built (feature inventory)](#2-what-is-built-feature-inventory)
3. [Design system & branding](#3-design-system--branding)
4. [Route map](#4-route-map)
5. [Roles & developer access](#5-roles--developer-access)
6. [Landing page (`/`)](#6-landing-page-)
7. [Workspace (`/app`, `/deploy`, …)](#7-workspace-app-deploy-)
8. [Startup builder & AI generation](#8-startup-builder--ai-generation)
9. [Authentication & sessions](#9-authentication--sessions)
10. [Middleware](#10-middleware)
11. [Database (Prisma)](#11-database-prisma)
12. [HTTP API reference](#12-http-api-reference)
13. [Admin console & site CMS](#13-admin-console--site-cms)
14. [Monetization (Stripe, licenses, downloads)](#14-monetization-stripe-licenses-downloads)
15. [Deployments & hosting](#15-deployments--hosting)
16. [Environment variables](#16-environment-variables)
17. [Local development](#17-local-development)
18. [Managing logo & partners](#18-managing-logo--partners)
19. [UI component inventory](#19-ui-component-inventory)
20. [Security notes](#20-security-notes)
21. [Known gaps & intentional limits](#21-known-gaps--intentional-limits)
22. [File index (quick reference)](#22-file-index-quick-reference)

---

## 1. Product positioning

**Mr.Software** is a **Software Business Operating System**: build, deploy, sell, manage, and scale from one platform — with developer storefronts at `/@handle` as the ecosystem identity layer.

> **Strategic north star:** see [`MR-SOFTWARE-2.0-VISION.md`](./MR-SOFTWARE-2.0-VISION.md) (five modules + four 2.0 systems), [`STRATEGIC-REVIEW.md`](./STRATEGIC-REVIEW.md), and [`ROADMAP-2.0.md`](./ROADMAP-2.0.md).

Core promise on the marketing site:

- **AI helps you build. You own the system.**
- Draft with AI guidance; review, edit, export, and deploy on **your** infrastructure.
- **No lock-in.** Marketplace, deploy, listings, and workspace share one auth and data model.

Five ecosystem modules (marketing narrative; maps to real routes):

| Module | Purpose | Primary routes |
|--------|---------|----------------|
| **Mr.Software AI / Builder** | Startup generation, landing + dashboard previews | `/app/builder`, `/startup/[id]` |
| **Mr.Software Cloud** | ZIP deploy, project URLs, preview API | `/deploy`, `/projects`, `/api/deploy` |
| **Mr.Software Marketplace** | Catalog, detail, checkout, entitlements | `/marketplace`, `/software/[id]`, `/app/marketplace` |
| **Mr.Software Studio** | Signed-in workspace — library, billing, settings | `/app`, `/app/home`, `/app/my-software` |
| **Mr.Software Academy** | Course catalog + lessons + admin CMS | `/academy`, `/admin/academy` |

Existing backend systems (auth, RBAC, Stripe, deployments, entitlements, admin audit) are **preserved**; the UI presents them as product-grade surfaces.

---

## 2. What is built (feature inventory)

### Marketing & brand

- [x] Full landing page with hero, marketplace spotlight, feature grid, bento, partners, team, CTA
- [x] **Inter** (body) + **Space Grotesk** (display headings) via `next/font/google`
- [x] **Warm orange** brand system (`--accent`, gradients, glow) — not a generic blue SaaS palette
- [x] **Light / dark theme** toggle (`data-theme`, `ThemeProvider`, persisted in `localStorage`)
- [x] Responsive site header; **signed-in users** see portal nav (Workspace, Marketplace, …) not marketing anchors
- [x] Logged-in **USER/DEVELOPER** redirect: `/marketplace` → `/app/marketplace`, `/software/[id]` → `/app/software/[id]`, `/@handle` → `/app/store/[handle]`
- [x] Partners / “Trusted by” section (`PartnersSection`, `id="partners"`)
- [x] Logo mark with **transparent** wrapper (no forced black tile); runtime URL from DB + `BrandSettingsProvider`
- [x] Dynamic favicon / apple icon from site settings

### Auth & users

- [x] Email + password register / login / logout
- [x] Google OAuth (optional env)
- [x] JWT cookie session with DB-backed `sessionVersion` invalidation
- [x] Roles: `USER`, `DEVELOPER`, `ADMIN`; statuses: `ACTIVE`, `RESTRICTED`, `SUSPENDED`, `BANNED`
- [x] **Developer access requests** — members submit pitch; admins approve at `/admin/developer-requests` (promotes to DEVELOPER)
- [x] Capability flags: `canUpload`, `canPublish`, `canWithdraw`

### Workspace

- [x] Login-gated `(workspace)` layout with dual shells (consumer vs developer)
- [x] Consumer: library, marketplace in app, my software, billing, **tabbed settings** (incl. developer access for USER)
- [x] Developer: command center, deploy, projects, earnings, listings, payouts, **storefront + social links**, builder
- [x] Portal product pages: `/app/software/[id]`, `/app/store/[handle]` inside workspace shell
- [x] AI copilot panel UI on developer shell (preview / not wired to external LLM by default)
- [x] Admin users visiting `/app` redirect to `/admin`

### Marketplace & money

- [x] Public catalog + software detail pages (public + portal variants)
- [x] **User reports** — public submit, admin queue at `/admin/reports`
- [x] Stripe Checkout sessions, webhooks, purchase entitlements
- [x] Chapa / Telebirr hooks (when env configured)
- [x] Signed download tokens + proxy stream (no public `assetUrl`)
- [x] Dev-only checkout grant when `ENABLE_DEV_CHECKOUT=true`

### Deploy

- [x] ZIP upload, safe unzip, slugged URLs, status lifecycle (`PENDING` → `ACTIVE` / `FAILED`)
- [x] Local filesystem or S3-backed storage
- [x] Deploy preview route for hosted static sites

### Academy

- [x] Public catalog `/academy`, course `/academy/[slug]`, lesson markdown renderer, progress API
- [x] Admin CMS `/admin/academy` — section settings, courses, lessons

### Admin

- [x] Operator console: users, software, deployments, payments, audit, system
- [x] **Developer access requests** (`/admin/developer-requests`)
- [x] **Reports queue** (`/admin/reports`)
- [x] **Academy CMS** (`/admin/academy`)
- [x] **Team CMS** (`/admin/team`)
- [x] **Site CMS** (`/admin/site`): logo URL, partner list, file uploads
- [x] **Testimonials review** (`/admin/testimonials`)
- [x] **Developer storefronts** (`/admin/storefronts`): verify / feature; public `/@handle` + settings UI with **social links**
- [x] Admin audit log for privileged mutations

### AI startup builder (MVP)

- [x] Rule-based / structured generation from user “idea” (`lib/startup/generate.ts`)
- [x] Persisted `GeneratedStartup` records
- [x] Startup landing + dashboard preview routes
- [x] Rate-limited `POST /api/generate-startup`

### Not production-complete (by design)

- [ ] Live LLM provider integration for builder / copilot (UI-ready)
- [ ] Full CSP, CSRF on all cookie forms
- [ ] Tax/VAT, refunds beyond basic Stripe webhooks
- [ ] Password-set flow for Google-only accounts

---

## 3. Design system & branding

### Tokens — `app/globals.css`

| Token | Role |
|-------|------|
| `--background`, `--foreground` | Page canvas & text |
| `--accent`, `--accent-hover`, `--accent-deep` | Brand orange (light: `#ea580c`; dark: `#f97316`) |
| `--accent-muted`, `--accent-glow`, `--accent-gradient` | Soft fills, shadows, gradient text |
| `--surface`, `--surface-elevated`, `--border` | Cards, panels, dividers |
| `--muted` | Secondary body copy |
| `--shadow-card`, `--shadow-hero` | Elevation |
| `--hero-glow`, `--grid-line` | Hero atmosphere |
| `--terminal-*` | Terminal / builder chrome |

Theme is applied with **`data-theme="light"` | `"dark"`** on `<html>` (not only `prefers-color-scheme`).

### Typography — `app/fonts.ts`

| Role | Font | Tailwind |
|------|------|----------|
| Body / UI | **Inter** | `font-sans` (default on `<body>`) |
| Headings / display | **Space Grotesk** | `font-display` |
| Code / mono | **Geist Mono** | `font-mono` |

Site layout (`app/(site)/layout.tsx`) applies `font-display` + `tracking-tight` to all `h1`–`h3` inside `<main>`.

### Key CSS utilities

- `.text-brand-gradient` — animated orange gradient on hero keywords
- `.landing-hero`, `.landing-hero-grid`, `.hero-preview-glow`
- `.browser-frame`, `.bento-cell`, `.btn-brand`, `.btn-ghost`
- `.bg-noise`, legacy `.landing-hero-gradient`, orbit/marquee helpers (older sections)

### Logo & partners

| Asset | Location | Runtime source |
|-------|----------|----------------|
| Default logo file | `public/brand/logo-mark.png` | Fallback in `lib/branding/constants.ts` |
| Logo URL (global) | — | `SiteSettings.logoUrl` → `BrandSettingsProvider` → `LogoMark` |
| Partner images | `public/brand/partners/*` | Paths in partner records |
| Partner list defaults | `lib/landing/partners.ts` | `defaultPartners` array |
| Partner list (CMS) | DB `SiteSettings.partnersJson` | Admin **`/admin/site`** |

**Logo component:** `components/brand/logo-mark.tsx` — transparent background, subtle ring, `next/image`, optional `src` override.

---

## 4. Route map

| URL / prefix | Layout | Auth | Purpose |
|--------------|--------|------|---------|
| `/` | `(site)` | Public | Landing page |
| `/marketplace` | `(site)` | Public (guests); **USER/DEVELOPER redirect** → `/app/marketplace` |
| `/software/[id]` | `(site)` | Public detail; **USER/DEVELOPER redirect** → `/app/software/[id]` |
| `/academy`, `/academy/[slug]` | `(site)` | Academy catalog & courses |
| `/report` | `(site)` | Report submission (login required to POST) |
| `/@handle` | `(site)` | Developer storefront; **signed-in redirect** → `/app/store/[handle]` |
| `/store/[handle]` | `(site)` | Storefront implementation |
| `/auth/login`, `/auth/register` | `auth/` | Public | Sign in / sign up |
| `/dashboard` | redirect | — | → `/app` |
| `/app`, `/app/*` | `(workspace)` | **Required** | Consumer + developer workspace |
| `/app/software/[id]` | `(workspace)` | **Required** | Product detail in portal shell |
| `/app/store/[handle]` | `(workspace)` | **Required** | Storefront in portal shell |
| `/deploy`, `/projects`, `/earnings`, `/listings`, `/payouts`, `/settings` | `(workspace)` | **Required** | Developer surfaces |
| `/startup/[id]`, … | `startup/` | Mixed | Generated startup previews |
| `/admin`, `/admin/*` | `admin/` | **ADMIN + ACTIVE** | Operator console |

**Root layout** (`app/layout.tsx`): fonts, global CSS, `ThemeScript`, `ThemeProvider`, `BrandSettingsProvider`, dynamic metadata/icons — **no** global marketing header (that lives under `(site)`).

### Admin routes (`/admin/*`)

| Path | Purpose |
|------|---------|
| `/admin` | Operations overview |
| `/admin/users` | Role, status, permissions (`?q=` search); manual DEVELOPER promotion |
| `/admin/developer-requests` | **Member → developer request queue** (approve / reject) |
| `/admin/software` | Catalog overview |
| `/admin/deployments` | Deployment status / failures |
| `/admin/payments` | Purchases |
| `/admin/reports` | **User report triage queue** |
| `/admin/academy` | **Courses, lessons, section settings** |
| `/admin/team` | **Landing team section** |
| `/admin/moderation` | Shortcuts into governance views |
| `/admin/system` | Deploy limits, operator notes |
| `/admin/site` | **Landing CMS** — logo, uploads, partnerships |
| `/admin/testimonials` | Review visitor-submitted landing testimonials |
| `/admin/storefronts` | Verify / feature developer storefronts |
| `/admin/audit` | Last 100 `AdminAuditLog` rows |

### Workspace routes (representative)

| Path | Shell | Purpose |
|------|-------|---------|
| `/app` | Developer (dev/admin) or redirect | Overview; **USER** → `/app/home` (middleware) |
| `/app/home` | Consumer | Library home |
| `/app/marketplace` | Consumer / dev | In-app marketplace (portal layout) |
| `/app/software/[id]` | Consumer / dev | Product detail in portal |
| `/app/store/[handle]` | Consumer / dev | Storefront in portal |
| `/app/my-software`, `/app/my-software/[id]` | Consumer | Owned / entitled software |
| `/app/billing`, `/app/settings` | Consumer | Account; settings incl. `#developer` for USER |
| `/app/storefront` | Developer | Storefront editor (handle, theme, social links) |
| `/app/builder` | Developer | AI startup builder |
| `/deploy` | Developer | ZIP deploy upload |
| `/projects`, `/projects/[id]` | Developer | Hosted projects |
| `/earnings`, `/listings`, `/payouts` | Developer | Monetization |
| `/settings` | Developer | Portal settings |

Shell selection: `lib/auth/workspace-surface.ts` → `WorkspaceShell` → consumer or developer chrome.

---

## 5. Roles & developer access

### Role matrix

| Role | Workspace entry | Deploy / listings | Admin |
|------|-----------------|-------------------|-------|
| `USER` | `/app/home` | No | No |
| `DEVELOPER` | `/app` | Yes (if ACTIVE + flags) | No |
| `ADMIN` | `/admin` | Yes | Yes |

### Member → developer promotion

Two paths:

1. **Request queue (recommended)** — member submits at `/app/settings#developer`; admin approves at `/admin/developer-requests`. Approve sets `User.role = DEVELOPER` and increments `sessionVersion`.
2. **Manual** — admin sets role dropdown on `/admin/users`.

**Model:** `DeveloperAccessRequest` — `PENDING` | `APPROVED` | `REJECTED`, fields `pitch`, `website`, `adminNote`, `reviewedById`.

**Lib:** `lib/developer-access/developer-access.ts`  
**API:** `GET|POST /api/developer-access`, `GET /api/admin/developer-requests`, `PATCH /api/admin/developer-requests/[id]`  
**UI:** `components/app/developer-access-request-form.tsx`, `components/admin/admin-developer-requests-panel.tsx`

Full walkthrough: [`USER-ADMIN-GUIDE.md` §4](./USER-ADMIN-GUIDE.md#4-developer-access-requests).

---

## 6. Landing page (`/`)

**File:** `app/(site)/page.tsx`

Sections in order:

| # | Component | `id` / anchor | Summary |
|---|-----------|---------------|---------|
| 1 | `landing-hero.tsx` | — | **“AI helps you build. You own the system.”** Browser-frame preview of builder; CTAs → `/app/builder`, `/marketplace` |
| 2 | `landing-marketplace-spotlight.tsx` | `#marketplace` | Marketplace teasers + link to catalog |
| 3 | `landing-features.tsx` | `#features` | Six-card grid: Builder, Marketplace, Deploy, Listings, Projects, Workspace |
| 4 | `landing-bento.tsx` | — | Bento: Idea→Deploy flow, developer control, ecosystem, AI-assist messaging |
| 5 | `partners-section.tsx` | `#partners` | Trusted-by logos; hidden if `partners.length === 0` |
| 6 | `landing-team.tsx` | `#team` | Team / founders block |
| 7 | `landing-cta-band.tsx` | — | Closing register / builder CTA |

**Site header nav:** Features, Marketplace, Partners, Team, Builder, theme toggle, `AuthNav`.

### Legacy landing components (in repo, not on `/` today)

Still available to re-import for A/B or alternate home layouts:

- `platform-preview.tsx` — tablet mock with tabbed workspace UI (slate canvas, **brand orange** accents)
- `how-it-works-flow.tsx` — Upload → Deploy → Discover → Earn flow cards
- `trust-metrics.tsx`, `trust-infrastructure.tsx`, `why-developers.tsx`
- `tech-stack-logos.tsx`, `hero-tech-orbit.tsx`, `ecosystem-architecture.tsx`
- `ai-startup-builder.tsx`, `global-vision.tsx`, `deploy-preview-panel.tsx`

---

## 7. Workspace (`/app`, `/deploy`, …)

### Shells

- **`WorkspaceShell`** — picks consumer vs developer by pathname + role.
- **`ConsumerWorkspaceShell`** — library-first: home, marketplace, my software, billing, settings.
- **`DeveloperWorkspaceShell`** — sidebar: command center, deploy, projects, revenue, marketplace, billing, settings; optional admin link; **`workspace-ai-panel.tsx`** on the right.

### Access rules

- `(workspace)/layout.tsx` calls `getSession()`; unauthenticated → `/auth/login?next=/app`.
- Active **ADMIN** on `/app` → redirect **`/admin`** (`app/(workspace)/app/page.tsx`).
- Middleware: plain **`USER`** hitting `/app` → **`/app/home`**.

---

## 8. Startup builder & AI generation

| Piece | Path |
|-------|------|
| Builder UI | `components/startup/startup-builder.tsx` |
| Workspace page | `app/(workspace)/app/builder/page.tsx` |
| Generate API | `POST /api/generate-startup` |
| Generator logic | `lib/startup/generate.ts` |
| Persistence | `lib/startup/db.ts`, model `GeneratedStartup` |
| Public preview | `app/startup/[id]/page.tsx`, `dashboard-preview/page.tsx` |

**Behavior today:** structured generation from the user’s idea (not a live OpenAI/Anthropic call unless you wire one in). Responses are validated with Zod; optional `save` persists to Postgres. Rate limit: 10 req/min per user+IP.

---

## 9. Authentication & sessions

### Session model

- Cookie: `mr_session` (`lib/auth/constants.ts`).
- JWT (HS256) with **`JWT_SECRET`**; payload includes user id, role, status, capability flags, `sessionVersion`.
- **`getSession()`** reloads the user from DB so bans and role changes apply immediately.

### Flows

- **Register / login / logout** — `app/api/auth/*`
- **Google OAuth** — `/api/auth/google` → callback; requires client id/secret + `JWT_SECRET`
- Google-only accounts cannot password-login (explicit error)
- OAuth redirect base: request origin or **`AUTH_PUBLIC_ORIGIN`**

### Demo accounts (after `npm run db:seed`)

| Email | Role | Password |
|-------|------|----------|
| `mock.user@mrsoftware.local` | USER | `password123` |
| `dev@mrsoftware.local` | DEVELOPER | `password123` |
| `admin@mrsoftware.local` | ADMIN | `password123` |

---

## 10. Middleware

**File:** `middleware.ts`

Matcher includes `/marketplace`, `/software/*`, `/store/*`, `/app/*`, `/admin/*`, deploy paths, and software/admin APIs.

- Strips spoofed `x-mr-software-*` headers; sets `x-mr-pathname` for layouts.
- **Catalog portal redirects** (JWT valid, role `USER` or `DEVELOPER`):
  - `/marketplace` → `/app/marketplace`
  - `/software/[id]` → `/app/software/[id]`
- **Storefront portal redirects** (JWT valid):
  - `/@handle` / `/store/[handle]` → `/app/store/[handle]` (ADMIN stays on public URL)
- Admin API + UI: **ADMIN + ACTIVE** required.
- Software **`POST`**: upload rules by role, status, `canUpload`.
- **`USER`** at `/app` → redirect `/app/home`.
- Active **ADMIN** on developer workspace paths → redirect `/admin`.

---

## 11. Database (Prisma)

**Schema:** `prisma/schema.prisma`

| Model | Role |
|-------|------|
| **User** | Accounts, OAuth, Stripe customer id, roles, flags, `sessionVersion` |
| **DeveloperAccessRequest** | Member → developer promotion queue |
| **UserReport** | Abuse / listing reports (admin triage) |
| **AcademySectionSettings**, **AcademyCourse**, **AcademyLesson**, **AcademyProgress** | Academy CMS + learner progress |
| **DeveloperStorefront** | `/@handle` identity; includes `socialLinksJson` |
| **GeneratedStartup** | AI builder output JSON per user |
| **AdminAuditLog** | Privileged admin actions |
| **SiteSettings** | Singleton `id = 1`: `logoUrl`, `partnersJson` |
| **Software** | Marketplace listings; **`assetUrl` never in public API** |
| **Purchase** | Entitlement / Stripe checkout state |
| **Subscription** | Workspace deploy quota (`FREE` / `PRO`) — not marketplace purchase |
| **Deployment** | User-hosted static sites |
| **TeamMember**, **Testimonial** | Landing page CMS (via admin team / testimonials) |

**Site settings I/O:** `lib/site-settings.ts` uses raw SQL upsert/read for reliability (`getPublicSiteSettings`, `upsertSiteSettings`).

**Seed:** `npm run db:seed` — demo users + six catalog items + FREE subscriptions for all users.

---

## 12. HTTP API reference

### Auth

| Method / path | Notes |
|---------------|--------|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Issue session cookie |
| `POST /api/auth/logout` | Clear session |
| `GET /api/auth/me` | Current user |
| `GET /api/auth/google` | Start OAuth |
| `GET /api/auth/callback/google` | OAuth callback |

### Catalog & commerce

| Method / path | Notes |
|---------------|--------|
| `GET /api/software` | Public list |
| `POST /api/software` | Create listing (middleware rules) |
| `GET /api/software/[id]` | Detail (no `assetUrl`) |
| `POST /api/checkout/session` | Stripe Checkout |
| `POST /api/webhooks/stripe` | Stripe webhooks |
| `POST /api/checkout/dev-grant` | Dev-only entitlement grant |
| `POST /api/software/[id]/download-token` | Short-lived download JWT |
| `GET /api/downloads/[softwareId]?token=` | Stream asset |

### Deploy & startups

| Method / path | Notes |
|---------------|--------|
| `POST /api/deploy` | Upload ZIP deployment |
| `GET /api/deployments`, `GET/PATCH /api/deployments/[id]` | List / update deployment |
| `GET /api/deploy-preview/[deploymentId]/[[...path]]` | Serve deployed static files |
| `POST /api/generate-startup` | Generate (and optionally save) startup package |
| `GET/POST /api/startups`, `GET /api/startups/[id]` | Saved startups API |

### Developer access & reports

| Method / path | Notes |
|---------------|--------|
| `GET /api/developer-access` | Member — request status |
| `POST /api/developer-access` | Member — submit pitch |
| `GET /api/admin/developer-requests` | Admin — queue + stats |
| `PATCH /api/admin/developer-requests/[id]` | Admin — approve / reject |
| `POST /api/reports` | Authenticated — submit report |
| `GET /api/admin/reports` | Admin — list reports |
| `PATCH /api/admin/reports/[id]` | Admin — triage |

### Storefront

| Method / path | Notes |
|---------------|--------|
| `GET /api/storefront` | Own storefront |
| `PUT /api/storefront` | Upsert handle, theme, bio, **socialLinks** |
| `GET /api/storefront/check` | Handle availability |
| `GET /api/storefront/[handle]` | Public store JSON |
| `POST /api/storefront/[handle]/follow` | Follow creator |

### Academy

| Method / path | Notes |
|---------------|--------|
| `GET /api/admin/academy` | Admin bundle |
| `PATCH /api/admin/academy/settings` | Section copy |
| CRUD under `/api/admin/academy/courses`, `.../lessons` | Course CMS |
| `POST /api/academy/[slug]/complete` | Mark lesson complete |

### Admin (users, site, team)

| Method / path | Notes |
|---------------|--------|
| `GET /api/admin/ping` | Health |
| `GET /api/admin/site-settings` | Read logo + partners |
| `PATCH /api/admin/site-settings` | Update logo + partners (**audited**) |
| `POST /api/admin/site-assets/upload` | Multipart upload → `public/brand/uploads/` |
| `PATCH /api/admin/users/[id]/permissions` | **audited** |
| `PATCH /api/admin/users/[id]/status` | **audited** |
| `PATCH /api/admin/users/[id]/role` | **audited**; blocks demoting sole active admin |
| `/api/admin/team/*` | Team landing CMS |
| `/api/admin/testimonials/*` | Testimonial review |
| `/api/admin/storefronts/*` | Verify / feature storefronts |

---

## 13. Admin console & site CMS

- Layout: `app/admin/layout.tsx`, shell `components/admin/admin-shell.tsx`.
- **Site settings UI:** `components/admin/admin-site-settings-form.tsx` on **`/admin/site`**.
- Upload scopes: `logo` | `partner`; PNG/JPG/WEBP/SVG/GIF; max 5MB.
- Audit helper: `lib/admin/audit.ts` (`logAdminAction` — errors swallowed; check server logs).

### CMS vs landing page wiring

| Setting | Global effect | Home `/` |
|---------|---------------|----------|
| **Logo URL** | Yes — `BrandSettingsProvider`, favicon | Yes |
| **Partners JSON** | Stored in DB | **`PartnersSection` uses `defaultPartners` from code unless you pass `partners={settings.partners}` from a server page** |

To wire admin partners to the home page, change `app/(site)/page.tsx` to a server component:

```tsx
import { getPublicSiteSettings } from "@/lib/site-settings";

export default async function Home() {
  const { partners } = await getPublicSiteSettings();
  return (
    <>
      {/* …other sections… */}
      <PartnersSection partners={partners} />
    </>
  );
}
```

---

## 14. Monetization (Stripe, licenses, downloads)

- Checkout from `Software.pricingModel` + optional `stripePriceId`.
- Webhooks update `Purchase` / subscription period.
- Entitlement checks: `lib/monetization/entitlement.ts`.
- Downloads: JWT token + proxy; **`assertFetchableAssetUrl`** for SSRF safety.
- **`assetUrl`** is private — never returned in public JSON.

Pricing models: `FREE`, `ONE_TIME`, `SUBSCRIPTION`.

---

## 15. Deployments & hosting

| Concern | Location |
|---------|----------|
| Upload + processing | `app/api/deploy/route.ts`, `lib/deploy/process-deployment.ts` |
| Safe unzip / path rules | `lib/deploy/safe-unzip.ts`, `lib/deploy/path-safety.ts` |
| Storage | `lib/deploy/storage.ts` — local dir or **S3** when configured |
| Public URL builder | `lib/deploy/public-url.ts` |
| Limits | `lib/subscription/limits.ts` |

Env: `DEPLOY_STORAGE`, `S3_*`, `LOCAL_DEPLOY_ROOT`, `DEPLOYMENT_PUBLIC_HOST`, `NEXT_PUBLIC_APP_URL`.

---

## 16. Environment variables

### Required

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Session + download token signing (strong random string) |

### Auth (optional)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `AUTH_PUBLIC_ORIGIN` | Canonical origin for OAuth redirects behind proxies |

### Stripe (optional)

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Checkout + API |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification |
| `ENABLE_DEV_CHECKOUT` | `true` in dev to enable `/api/checkout/dev-grant` |

### Deploy / assets (optional)

| Variable | Purpose |
|----------|---------|
| `DEPLOY_STORAGE` | `s3` for remote storage |
| `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | S3 |
| `S3_ENDPOINT`, `S3_FORCE_PATH_STYLE` | Compatible object stores |
| `LOCAL_DEPLOY_ROOT` | Local deploy directory |
| `DEPLOYMENT_PUBLIC_HOST`, `DEPLOYMENT_USE_SUBDOMAIN` | Public deployment URLs |
| `NEXT_PUBLIC_APP_URL` | App base URL |
| `ALLOWED_ASSET_FETCH_HOSTS` | Comma-separated hosts for download proxy |

### Example `.env` (local)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mr_software?schema=public
JWT_SECRET=change-me-to-a-long-random-string
ENABLE_DEV_CHECKOUT=true
```

---

## 17. Local development

### Database

```bash
docker compose up -d
npm run db:push
npm run db:seed
```

Default DB URL matches `docker-compose.yml` (see comment in file).

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next dev (**webpack** — stable on Windows/OneDrive) |
| `npm run dev:clean` | Delete `.next`, then dev |
| `npm run dev:turbo` | Turbopack dev (faster; may differ from CI build) |
| `npm run build` | `prisma generate && next build` |
| `npm run start` | Production server |
| `npm run db:generate` | Prisma client |
| `npm run db:push` | Push schema |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Prisma Studio |

### Windows / OneDrive notes

- Project path on OneDrive can delay file sync (logo PNG updates) — wait for sync or hard-refresh.
- Webpack persistent cache disabled in dev in `next.config.ts` to avoid flaky `.next` renames.
- If dev errors persist: `npm run dev:clean`.

### Smoke test checklist

1. Open `/` — landing sections render; theme toggle works.
2. Register or log in as `dev@mrsoftware.local`.
3. `/marketplace` — seeded listings visible.
4. `/app/builder` — generate a startup (signed in).
5. `/admin` as admin — users table + site settings save.
6. `/deploy` as developer — upload flow (requires deploy permissions + limits).

---

## 18. Managing logo & partners

### Logo (recommended paths)

1. **File replace:** Drop new image at `public/brand/logo-mark.png` (same filename).
2. **Admin CMS:** `/admin/site` — set URL or upload; updates nav, footer, auth, favicon globally after refresh.
3. **Component:** `LogoMark` uses transparent tile; do not wrap in solid black (breaks colored/transparent marks).

### Partners

1. Add images under `public/brand/partners/` (e.g. `acme.png`).
2. Edit **`lib/landing/partners.ts`** (`defaultPartners`) **or** admin **`/admin/site`** (DB).
3. Ensure home page passes DB partners (see [CMS vs landing page wiring](#cms-vs-landing-page-wiring)).
4. Section anchor: **`/#partners`**; header link: **Partners**.

Partner record shape:

```ts
{
  name: "Acme Corp",
  label: "Acme Corp",           // optional alt text
  logo: "/brand/partners/acme.png",
  href: "https://acme.example",   // optional
}
```

Empty array → section hidden.

---

## 19. UI component inventory

### Marketing

| Area | Key files |
|------|-----------|
| Chrome | `components/site-header.tsx`, `site-footer.tsx`, `auth-nav.tsx` |
| Landing | `components/landing/*` |
| Shared UI | `components/landing/landing-ui.tsx` (`LandingContainer`, `SectionLabel`, `BrowserFrame`, …) |
| Theme | `components/theme/theme-provider.tsx`, `theme-toggle.tsx`, `theme-script.tsx` |

### Workspace

| Area | Key files |
|------|-----------|
| Router shell | `components/app/workspace-shell.tsx` |
| Developer | `components/app/developer-workspace-shell.tsx`, `developer-top-bar.tsx` |
| Consumer | `components/app/consumer-workspace-shell.tsx`, `portal-top-bar.tsx` |
| Deploy | `components/app/deploy-upload-form.tsx`, `deployment-card.tsx` |
| AI panel | `components/app/workspace-ai-panel.tsx` |

### Admin

`components/admin/admin-shell.tsx`, `admin-top-bar.tsx`, `admin-users-table.tsx`, `admin-site-settings-form.tsx`

### Brand

`components/brand/logo-mark.tsx`, `brand-settings-provider.tsx`, `lib/branding/constants.ts`

---

## 20. Security notes

| Area | Implementation |
|------|----------------|
| Access control | `getSession()`, `isActiveAdmin`, per-user deployments, download tokens |
| Cryptography | bcrypt (12 rounds); strong `JWT_SECRET` |
| Injection | Prisma; Zod on admin/auth/site bodies; safe ZIP extract |
| Rate limits | Login, register, download, deploy, generate-startup (`lib/security/rate-limit.ts`) |
| Headers | Security headers in `next.config.ts` |
| Uploads | Deploy blocklists; admin asset type/size limits |
| Audit | `AdminAuditLog` + stderr security events |
| SSRF | `assertFetchableAssetUrl` for download proxy |

**Not default:** full CSP; CSRF tokens on all cookie-authenticated forms.

---

## 21. Known gaps & intentional limits

- **Partners on `/`:** DB partners from admin may not appear until `page.tsx` passes `getPublicSiteSettings().partners` (defaults used today).
- **AI copilot / builder:** UI previews; no bundled paid LLM API key unless configured.
- **Production runbook:** HTTPS, secret rotation, backup strategy — out of scope here.
- **Email on developer approval:** In-app status only; no automatic email unless `RESEND_API_KEY` digest paths used elsewhere.
- **Legacy landing sections:** built and styled but not all mounted on current home.

---

## 22. File index (quick reference)

| Area | Paths |
|------|--------|
| Root / tokens / fonts | `app/layout.tsx`, `app/globals.css`, `app/fonts.ts` |
| Site settings | `lib/site-settings.ts`, `lib/branding/constants.ts`, `lib/landing/partners.ts` |
| Marketing | `app/(site)/`, `components/landing/`, `components/site-header.tsx` |
| Workspace | `app/(workspace)/`, `components/app/workspace-*.tsx` |
| Startup / AI | `app/(workspace)/app/builder/`, `lib/startup/*`, `components/startup/*` |
| Admin | `app/admin/`, `app/api/admin/`, `components/admin/` |
| Auth | `app/api/auth/*`, `lib/auth/*` |
| Prisma | `prisma/schema.prisma`, `prisma/seed.ts`, `prisma.config.ts` |
| Monetization | `lib/monetization/*`, `app/api/checkout/*`, `app/api/webhooks/stripe/` |
| Deploy | `lib/deploy/*`, `app/api/deploy/` |
| Developer access | `lib/developer-access/*`, `app/api/developer-access/`, `app/admin/developer-requests/` |
| Reports | `lib/reports.ts`, `app/api/reports/`, `components/reports/*` |
| Academy | `lib/academy/*`, `components/academy/*`, `app/(site)/academy/` |
| Storefront social | `lib/storefront/social-links.ts`, `components/storefront/storefront-social-links.tsx` |
| Site nav (signed-in) | `components/site-nav-links.ts`, `components/auth/use-auth-me.ts` |
| Validation | `lib/validation/site-settings.ts`, `lib/validation/admin-users.ts`, `lib/validation/developer-access.ts`, `lib/validation/reports.ts`, `lib/validation/academy.ts` |
| Docs | `docs/README.md`, `docs/USER-ADMIN-GUIDE.md`, `docs/PROJECT.md`, `docs/MR-SOFTWARE-2.0-VISION.md`, `docs/STRATEGIC-REVIEW.md`, `docs/ROADMAP-2.0.md`, `public/brand/README.md` |

---

*Last updated: June 2026 — developer access requests, portal routing, academy CMS, reports queue, storefront social links, tabbed settings, signed-in site nav. See [`USER-ADMIN-GUIDE.md`](./USER-ADMIN-GUIDE.md) for operational flows.*
