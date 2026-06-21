# Mr.Software documentation

Start here for platform documentation.

| Document | Audience | Contents |
|----------|----------|----------|
| **[MVP-LAUNCH-PLAN.md](./MVP-LAUNCH-PLAN.md)** | Founders | **Start here for launch** — 4 phases, what to ship vs defer |
| **[LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md)** | DevOps / founders | Production checklist — domain, GitHub OAuth, Stripe, smoke tests |
| **[USER-ADMIN-GUIDE.md](./USER-ADMIN-GUIDE.md)** | Members, developers, admins | Step-by-step flows: roles, developer requests, marketplace, storefronts, settings, reports, academy |
| **[PROJECT.md](./PROJECT.md)** | Engineers | Architecture, routes, APIs, Prisma models, env vars, security, file index |
| **[MR-SOFTWARE-2.0-VISION.md](./MR-SOFTWARE-2.0-VISION.md)** | Product / strategy | North star, five modules, four 2.0 systems, storefront phases |
| **[STRATEGIC-REVIEW.md](./STRATEGIC-REVIEW.md)** | Founders / investors | External assessment, scores, platform response |
| **[ROADMAP-2.0.md](./ROADMAP-2.0.md)** | Engineering / product | Phased delivery: Startup Factory, live map, GitHub-first, AI team |

## Quick links by role

### Member (USER)
- Library home: `/app/home`
- Marketplace (with sidebar): `/app/marketplace`
- Request developer access: `/app/settings#developer`
- Settings: `/app/settings`

### Developer (DEVELOPER)
- **Startup Factory:** `/app/factory` — guided idea → listing flow
- Command center: `/app`
- Storefront settings: `/app/storefront` → public page `/@your-handle`
- Listings: `/listings`
- Deploy: `/deploy`

### Admin (ADMIN)
- Overview: `/admin`
- **Developer access requests:** `/admin/developer-requests`
- Users & manual role promotion: `/admin/users`
- Reports queue: `/admin/reports`
- Academy CMS: `/admin/academy`
- Team & testimonials: `/admin/team`, `/admin/testimonials`

## Local setup (short)

```bash
docker compose up -d
npm install
npm run db:push
npm run db:seed
npm run dev
```

Demo logins after seed — password `password123`:

| Email | Role |
|-------|------|
| `mock.user@mrsoftware.local` | USER (member) |
| `dev@mrsoftware.local` | DEVELOPER |
| `admin@mrsoftware.local` | ADMIN |

After schema changes: `npm run db:push && npx prisma generate`, then restart `npm run dev`.
