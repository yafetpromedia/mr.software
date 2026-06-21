# Mr.Software — MVP launch plan

**Principle:** Do not add 50 more features. Turn what exists into a product people can actually use.

**Last updated:** June 2026

---

## Where we are today

| Area | Status |
|------|--------|
| Auth, roles, developer requests | Shipped |
| Marketplace + Stripe checkout | Shipped |
| ZIP deploy + preview URL | Shipped |
| GitHub OAuth deploy | Shipped (needs UX polish as default path) |
| Developer storefronts `/@handle` | Shipped (needs deployments + polish) |
| Startup Factory wizard | Shipped (Phase 3 signature feature — not launch blocker) |
| Live globe map | Shipped (Phase 4 visual identity — after users) |

---

## Phase 1 — Launch MVP (next 2–4 weeks)

Ship only these three things.

### 1. Finish deployment (P0)

**Today:** Upload ZIP → deploy → preview URL.

**Target:**

```text
GitHub repository → Connect → Deploy → Live URL
```

This is the **single most important technical feature** for launch.

| Task | Owner | Status |
|------|-------|--------|
| GitHub as default path in Deployment Center | Engineering | In progress |
| Clear success state with copyable live URL | Engineering | In progress |
| GitHub OAuth documented in ops guide | Docs | TODO |
| `GITHUB_CLIENT_ID` / `SECRET` on production | DevOps | TODO |

ZIP upload stays as fallback for non-GitHub users.

### 2. Complete developer storefronts (P0)

**Target:** `mr.software/@yafet` feels like **GitHub profile + App Store page**.

| Element | Status |
|---------|--------|
| Profile name + avatar | Shipped |
| Bio + tagline | Shipped |
| Social links | Shipped |
| Software products grid | Shipped |
| Verified badge | Shipped (admin) |
| Revenue badge (opt-in public) | Shipped |
| **Live deployments section** | In progress |
| Themes (Classic / Midnight / Minimal) | Shipped |

### 3. Publish Mr.Software publicly (P0)

You need **real users** before building more features.

| Step | Notes |
|------|--------|
| Register / connect **mr.software** domain | DNS → hosting provider |
| Production PostgreSQL + env secrets | See [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md) |
| Stripe live keys + webhook URL | Required for paid listings |
| GitHub OAuth app (production callback) | Required for GitHub deploy |
| Seed removed or clearly marked demo | Avoid confusing first visitors |
| Admin account secured | Strong password, 2FA on email |

---

## Phase 2 — First users (weeks 4–8)

**Targets (not feature count):**

| Metric | Goal |
|--------|------|
| Developers | 10 |
| Members | 50 |
| Published projects | 5 |

**Ask developers to:**

1. Upload or connect a website (GitHub deploy)
2. Publish one software listing
3. Give feedback in a short call or form

Ten real users teach more than 100 new features.

---

## Phase 3 — Signature feature (after traction)

**One thing people remember:** AI Startup Factory — as close to one-click as possible.

```text
Idea → AI validation → Landing page → Dashboard → Deploy → Marketplace listing
```

The wizard at `/app/factory` is the foundation. Phase 3 tightens it into a **single continuous flow**, not five separate pages.

Do **not** prioritize this over Phase 1–2.

---

## Phase 4 — African ecosystem (after users arrive)

The **globe interface** — Ethiopia, Kenya, Nigeria, South Africa, Egypt — showing startups launching in real time.

Already built at `/explore/map` and on the homepage hero. Becomes the **visual identity** once there is enough live activity to fill it.

Until then: admin **Hybrid** mode (real + demo) at `/admin/site`.

---

## What we are NOT building before launch

- Store-level subscriptions (Storefront Phase 4)
- Full browser IDE
- Multi-agent AI automation
- New marketplace categories / reviews system
- Chapa/Telebirr (unless required for first Ethiopian users)
- Mobile apps

---

## Success definition for MVP

A developer can:

1. Sign up → get developer access approved
2. Connect GitHub → deploy → share a **live URL**
3. Set up `/@handle` → looks professional with products + deployments
4. Publish a listing → someone can buy (Stripe)

A visitor can:

1. Browse marketplace
2. Visit a developer storefront
3. Understand what Mr.Software is in under 30 seconds

---

## Related docs

- [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md) — production deploy steps
- [USER-ADMIN-GUIDE.md](./USER-ADMIN-GUIDE.md) — operations
- [ROADMAP-2.0.md](./ROADMAP-2.0.md) — technical backlog (post-MVP)
- [STRATEGIC-REVIEW.md](./STRATEGIC-REVIEW.md) — positioning
