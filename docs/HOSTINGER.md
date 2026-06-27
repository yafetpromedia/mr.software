# Host Mr.Software on Hostinger — mrsoftware-et.com

This app is **Next.js + PostgreSQL + Docker**. Use **Hostinger VPS** (KVM), not shared web hosting — shared plans cannot run this stack reliably.

---

## 1. What to buy on Hostinger

| Plan | Works? |
|------|--------|
| **VPS** (Ubuntu 22.04+, 2 GB+ RAM) | Yes — recommended |
| Shared / WordPress hosting | No — no Docker / long-running Node |

Minimum: **2 GB RAM VPS** (app + Postgres in Docker).

---

## 2. Point your domain

In **Hostinger → Domains → mrsoftware-et.com → DNS**:

| Type | Name | Value |
|------|------|--------|
| **A** | `@` | Your VPS public IP |
| **A** | `www` | Same VPS IP |

Wait 5–30 minutes for DNS to propagate.

---

## 3. Set up the VPS (SSH)

```bash
# Connect (replace with your VPS IP)
ssh root@YOUR_VPS_IP

# Install Docker
curl -fsSL https://get.docker.com | sh
apt install -y git

# Clone the app
git clone https://github.com/yafetpromedia/mr.software.git
cd mr.software
```

---

## 4. Production environment

```bash
cp .env.production.example .env.production
npm run prod:secrets
```

Copy the generated secrets into `.env.production`, then edit:

```env
POSTGRES_PASSWORD=<strong password from prod:secrets>
JWT_SECRET=<long random string from prod:secrets>

NEXT_PUBLIC_APP_URL=https://mrsoftware-et.com
AUTH_PUBLIC_ORIGIN=https://mrsoftware-et.com

# Copy from your local .env (or create new production keys)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=<from prod:secrets>
AI_API_KEY=

# Do NOT enable maintenance lock in production
# AUTH_LOCK=true
```

Validate:

```bash
npm run prod:check
```

---

## 5. Start the app

```bash
npm run prod:up
docker compose -f docker-compose.prod.yml exec app npx prisma db push
```

Optional first-time admin (works in Docker — use this instead of `db:seed`):

```bash
docker compose -f docker-compose.prod.yml exec app npm run db:bootstrap-admin
```

Sign in with `admin@mrsoftware.local` / `password123`, then change the password.

Full demo data (local dev only — requires full source tree):

```bash
npm run db:seed
```

App runs on **http://YOUR_VPS_IP:3000** (HTTPS comes next).

---

## 6. HTTPS with Caddy

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

cd /root/mr.software   # or your clone path
caddy run --config deploy/Caddyfile
```

For a permanent service, install Caddy as systemd (see [caddyserver.com/docs](https://caddyserver.com/docs/install)).

Open **https://mrsoftware-et.com** — you should see the site with a valid certificate.

---

## 7. Register OAuth URLs (required for sign-in & GitHub deploy)

### Google Cloud Console

**APIs & Services → Credentials → your OAuth client → Authorized redirect URIs:**

```
https://mrsoftware-et.com/api/auth/callback/google
```

**Authorized JavaScript origins:**

```
https://mrsoftware-et.com
```

### GitHub OAuth App

| Field | Value |
|-------|--------|
| Homepage URL | `https://mrsoftware-et.com` |
| Authorization callback URL | `https://mrsoftware-et.com/api/github/callback` |

---

## 8. After go-live checklist

- [ ] `AUTH_LOCK` is **not** set (or `false`) — users can register and log in
- [ ] Change default admin password if you ran `db:seed`
- [ ] Upload logo at `/admin/site`
- [ ] Test: register → login → browse marketplace
- [ ] Test: Google sign-in
- [ ] Test: GitHub deploy (if using)

---

## 9. Updates later

```bash
cd mr.software
git pull
npm run prod:up
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Site not loading | Check DNS A record, firewall ports **80** and **443** open on VPS |
| OAuth fails | Redirect URI must match exactly (https, no trailing slash) |
| Database error | `docker compose -f docker-compose.prod.yml ps` — ensure `db` is healthy |
| Admin login fails / seed error | Run `docker compose -f docker-compose.prod.yml exec app npm run db:bootstrap-admin` |
| “Maintenance mode” for users | Remove `AUTH_LOCK=true` from `.env.production` and restart containers |

See also [DEPLOY-PRODUCTION.md](./DEPLOY-PRODUCTION.md) for full env reference.
