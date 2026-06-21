# Production launch checklist

Use this when connecting **mr.software** and going live. Check items off in order.

---

## 1. Hosting & domain

- [ ] Register or transfer **mr.software** domain
- [ ] Point DNS (A/CNAME) to production host (Vercel, Railway, VPS, etc.)
- [ ] TLS certificate active (HTTPS)
- [ ] Set `NEXT_PUBLIC_APP_URL=https://mr.software` (or your canonical URL env name)

---

## 2. Database

- [ ] Managed PostgreSQL provisioned (not local Docker)
- [ ] `DATABASE_URL` set in production secrets
- [ ] Run `npx prisma db push` (or migrate) against production once
- [ ] Run seed **only** if you want demo data — otherwise skip seed for clean launch
- [ ] Backup policy enabled

---

## 3. Auth & sessions

- [ ] `JWT_SECRET` — long random string, unique to production
- [ ] Google OAuth credentials (if using Google sign-in) with production redirect URIs
- [ ] Cookie domain / secure flags correct for HTTPS

---

## 4. GitHub deploy (Phase 1 priority)

- [ ] Create GitHub OAuth App: **Settings → Developer settings → OAuth Apps**
- [ ] Homepage URL: `https://mr.software`
- [ ] Callback URL: `https://mr.software/api/github/callback`
- [ ] Set production env:
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
- [ ] Test: Developer connects GitHub → selects repo → receives live URL

---

## 5. Stripe (marketplace payments)

- [ ] Stripe account in **live** mode
- [ ] `STRIPE_SECRET_KEY` (live)
- [ ] `STRIPE_WEBHOOK_SECRET` for `https://mr.software/api/webhooks/stripe`
- [ ] Webhook events: `checkout.session.completed`, subscription events as configured
- [ ] Test purchase on a real listing (small price)

---

## 6. File storage (deployments)

- [ ] If using S3: `AWS_*` or compatible object storage env vars set
- [ ] If local disk only: ensure persistent volume on host (not ephemeral serverless without S3)
- [ ] Max upload size aligned with deploy limits (ZIP 50 MB)

---

## 7. AI features (optional for MVP)

- [ ] LLM API key if Startup Advisor / Factory should work in production
- [ ] Rate limits acceptable for expected traffic
- [ ] Without keys: rule-based builder still works; advisor shows graceful message

---

## 8. Admin & content

- [ ] Change default admin password from seed (`admin@mrsoftware.local`)
- [ ] Upload production logo at `/admin/site`
- [ ] Set launch map mode: **Hybrid** until 5+ real deploys, then **Live**
- [ ] Approve testimonials / team CMS if using landing content

---

## 9. Smoke test (before announcing)

| Flow | Pass |
|------|------|
| Register new member | ☐ |
| Request developer access → admin approve | ☐ |
| Connect GitHub → deploy static site → open live URL | ☐ |
| Create storefront `@handle` → public page loads | ☐ |
| Publish listing → appears on marketplace | ☐ |
| Checkout (test card or live) → entitlement granted | ☐ |
| Logged-in member sees portal sidebar on marketplace | ☐ |

---

## 10. Announce (Phase 2)

- [ ] Invite **10 developers** personally (not a mass post)
- [ ] Share one example storefront (e.g. `@devstudio` or your own)
- [ ] Collect feedback in Notion / form / calls
- [ ] Fix top 3 blockers before adding features

---

See [MVP-LAUNCH-PLAN.md](./MVP-LAUNCH-PLAN.md) for strategy and priorities.
