#!/bin/sh
set -e

# Always derive DATABASE_URL from POSTGRES_* in Compose so it matches the `db` service.
if [ -n "${POSTGRES_PASSWORD:-}" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB:-mr_software}?schema=public"
elif [ -n "${DATABASE_URL:-}" ]; then
  case "$DATABASE_URL" in
    *@localhost:*|*@127.0.0.1:*)
      export DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed -e 's/@localhost:/@db:/' -e 's/@127.0.0.1:/@db:/')"
      ;;
  esac
fi

mkdir -p /var/mr-software/site-uploads/logo /var/mr-software/site-uploads/partners /var/mr-software/site-uploads/team
mkdir -p /var/mr-software/deployments
mkdir -p /app/public/brand/uploads/logo /app/public/brand/uploads/partners /app/public/brand/uploads/team

# Docker volumes mount as root — allow the app user to read/write uploads.
chown -R nextjs:nodejs /var/mr-software/site-uploads /var/mr-software/deployments /app/public/brand/uploads

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Syncing database schema (prisma db push)..."
  if ! gosu nextjs npx prisma db push --skip-generate; then
    echo "Warning: prisma db push failed — listings/deploy may fail until schema is synced manually."
  fi
fi

exec gosu nextjs "$@"
