# Production deployment — Mr.Software

Use this checklist when hosting Mr.Software on a real domain (e.g. `mr.software`).

## Required

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Session signing (long random string) |
| `NEXT_PUBLIC_APP_URL` | Public app URL, e.g. `https://mr.software` |
| `AUTH_PUBLIC_ORIGIN` | Same as app URL if OAuth callbacks need a fixed origin |

## GitHub deploy + auto-deploy on push

| Variable | Purpose |
|----------|---------|
| `GITHUB_CLIENT_ID` | OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | OAuth app secret |
| `GITHUB_WEBHOOK_SECRET` | Random secret for `X-Hub-Signature-256` verification |

**OAuth callback:** `https://your-domain.com/api/github/callback`

**Webhook URL pattern:** `https://your-domain.com/api/webhooks/github/{deploymentId}`  
(Webhooks are registered automatically when “Auto-deploy on git push” is enabled.)

## Deploy storage

### Local disk (dev / single VPS)

```env
LOCAL_DEPLOY_ROOT=/var/mr-software/deployments
```

Use a **persistent volume** — not ephemeral serverless disk.

### S3-compatible storage (recommended for production)

```env
DEPLOY_STORAGE=s3
S3_BUCKET=your-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
# Optional for MinIO / R2:
# S3_ENDPOINT=https://...
# S3_FORCE_PATH_STYLE=true
```

## Public deployment URLs

Default: `https://your-domain.com/api/deploy-preview/{id}/`

### Branded subdomains (optional)

```env
DEPLOYMENT_PUBLIC_HOST=mr.software
DEPLOYMENT_USE_SUBDOMAIN=true
```

Serves deployments at `https://{slug}-{userId}.mr.software` (requires DNS wildcard + reverse proxy).

## Payments (marketplace)

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Live secret key |
| `STRIPE_WEBHOOK_SECRET` | `https://your-domain.com/api/webhooks/stripe` |

## Runtime hosts (Node / PHP / Python deploys)

The machine running Mr.Software must have:

- **Node.js** (same major as your app) for Next.js / Express deploys
- **PHP** in `PATH` for PHP projects
- **Python 3 + pip** for Django / Flask

Databases: use external Postgres (Supabase, Neon, etc.) via `DATABASE_URL` in the deployed app’s `.env` inside the ZIP/repo.

## AI (optional)

```env
AI_API_KEY=
AI_BASE_URL=https://api.freemodel.dev/v1
AI_MODEL=claude-t0
```

## Health check after deploy

1. Sign in as a developer
2. **Deploy → Upload ZIP** with a static `index.html`
3. Open the live URL
4. **Deploy → GitHub** with auto-deploy enabled; push to the default branch
5. Confirm webhook delivery in GitHub repo → Settings → Webhooks
