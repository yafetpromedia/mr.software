# Mr.Software

Software Business Operating System — marketplace, deploy, developer storefronts, academy, and admin console.

## Documentation

| Doc | Description |
|-----|-------------|
| **[docs/MVP-LAUNCH-PLAN.md](docs/MVP-LAUNCH-PLAN.md)** | **Launch strategy** — MVP phases, what to ship vs defer |
| **[docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md)** | Production go-live checklist |
| **[docs/USER-ADMIN-GUIDE.md](docs/USER-ADMIN-GUIDE.md)** | **Start here** — roles, developer requests, marketplace, settings, admin queues |
| **[docs/PROJECT.md](docs/PROJECT.md)** | Technical reference — routes, APIs, Prisma, env, architecture |
| **[docs/MR-SOFTWARE-2.0-VISION.md](docs/MR-SOFTWARE-2.0-VISION.md)** | North star — Software Business OS, `@handle`, four 2.0 systems |
| **[docs/ROADMAP-2.0.md](docs/ROADMAP-2.0.md)** | Engineering roadmap — Startup Factory, live globe, GitHub-first, AI team |
| **[docs/README.md](docs/README.md)** | Documentation index & quick links |

## Quick start

```bash
docker compose up -d
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo accounts** (password `password123`):

| Email | Role |
|-------|------|
| `mock.user@mrsoftware.local` | Member |
| `dev@mrsoftware.local` | Developer |
| `admin@mrsoftware.local` | Admin |

## Key URLs

| Role | Where to go |
|------|-------------|
| Member | `/app/home` · request developer access at `/app/settings#developer` |
| Developer | `/app` · storefront `/app/storefront` |
| Admin | `/admin` · developer requests `/admin/developer-requests` |

Stack: Next.js 16, React 19, Prisma 7, PostgreSQL, Tailwind CSS 4.
