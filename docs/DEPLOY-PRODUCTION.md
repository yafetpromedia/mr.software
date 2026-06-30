# Production deployment — MrSoftware ET (mrsoftware-et.com)

Use this when hosting on **mrsoftware-et.com** (or your domain) on a VPS with Docker.

## Quick start (VPS)

### 1. Server requirements

- Ubuntu 22.04+ (or similar Linux)
- Docker + Docker Compose
- Domain DNS **A record** → server IP
- Ports **80** and **443** (for Caddy TLS)

### 2. Clone and configure

```bash
git clone https://github.com/yafetpromedia/mr.software.git
cd mr.software
cp .env.production.example .env.production
npm run prod:secrets >> .env.production   # paste generated lines into the file
```

Edit `.env.production`:

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | `https://mrsoftware-et.com` |
| `AUTH_PUBLIC_ORIGIN` | `https://mrsoftware-et.com` |
| `GITHUB_CLIENT_ID` / `SECRET` | From GitHub OAuth app |
| `GITHUB_WEBHOOK_SECRET` | From `prod:secrets` |
| `POSTGRES_PASSWORD` | Strong password |

Validate:

```bash
npm run prod:check
```

### 3. Build and start

```bash
npm run prod:up
docker compose -f docker-compose.prod.yml exec app npx prisma db push
# Optional demo data (skip for clean launch):
# docker compose -f docker-compose.prod.yml exec app npm run db:seed
```

App listens on `http://localhost:3000`.

### 4. HTTPS with Caddy

```bash
sudo apt install -y caddy
sudo caddy run --config deploy/Caddyfile
# Or install as systemd service — see caddyserver.com/docs
```

### 5. Register external services

| Service | URL to register |
|---------|-----------------|
| GitHub OAuth callback | `https://mrsoftware-et.com/api/github/callback` |
| Stripe webhook | `https://mrsoftware-et.com/api/webhooks/stripe` |
| Google OAuth (if used) | `https://mrsoftware-et.com/api/auth/callback/google` |

GitHub **push webhooks** are created automatically per deployment when auto-deploy is enabled.

---

## Environment reference

### Required

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL (set automatically in Docker Compose) |
| `JWT_SECRET` | Session signing (32+ random bytes) |
| `NEXT_PUBLIC_APP_URL` | Public app URL |
| `AUTH_PUBLIC_ORIGIN` | OAuth origin (same as app URL) |

### GitHub deploy + auto-deploy

| Variable | Purpose |
|----------|---------|
| `GITHUB_CLIENT_ID` | OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | OAuth app secret |
| `GITHUB_WEBHOOK_SECRET` | Verifies `X-Hub-Signature-256` on push |

### Deploy storage

**Docker (default):** persistent volume at `/var/mr-software/deployments`

**S3 / R2 (recommended at scale):**

```env
DEPLOY_STORAGE=s3
S3_BUCKET=your-bucket
S3_REGION=auto
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=https://xxxx.r2.cloudflarestorage.com
```

### Branded deployment subdomains (optional)

```env
DEPLOYMENT_PUBLIC_HOST=mrsoftware-et.com
DEPLOYMENT_USE_SUBDOMAIN=true
```

Requires `*.mrsoftware-et.com` DNS wildcard + proxy rules in `deploy/Caddyfile`.

### Payments

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Runtime deploys (Node / PHP / Python)

The Docker image includes **Node 20**, **PHP**, and **Python 3** for user deploy runtimes.

User apps use external Postgres via `DATABASE_URL` in their own `.env` (Supabase, Neon, etc.).

---

## npm scripts

| Command | Action |
|---------|--------|
| `npm run prod:secrets` | Generate JWT, webhook, and DB passwords |
| `npm run prod:check` | Validate `.env.production` |
| `npm run prod:up` | Build and start Docker stack |
| `npm run prod:down` | Stop stack |

---

## Health check after go-live

1. Open `https://mrsoftware-et.com` — homepage loads
2. Sign in as developer (`dev@mrsoftware.local` only if you ran seed)
3. **Deploy → Upload ZIP** with `index.html` → live URL works
4. **Deploy → GitHub** → connect repo → enable auto-deploy → push → redeploys
5. **Startup Factory** → generate → one-click deploy
6. Change default admin password if seed was used

---

## Bare metal (no Docker)

```bash
npm ci
cp .env.production.example .env.production
# Set DATABASE_URL to managed Postgres
npm run prod:check
npx prisma db push
npm run build
npm start
```

Use **pm2** or **systemd** to keep the process running. Point Caddy at port 3000.

---

## Security checklist

- [ ] Unique `JWT_SECRET` and `GITHUB_WEBHOOK_SECRET` per environment
- [ ] HTTPS only (`NEXT_PUBLIC_APP_URL` uses `https://`)
- [ ] Do not run `db:seed` on production unless you want demo accounts
- [ ] Rotate `admin@mrsoftware.local` password
- [ ] S3 bucket is private; app uses IAM keys with minimal scope
