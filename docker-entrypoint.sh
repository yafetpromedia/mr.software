#!/bin/sh
set -e

# Build DATABASE_URL from Postgres vars when not set explicitly (.env.production).
if [ -z "${DATABASE_URL:-}" ] && [ -n "${POSTGRES_PASSWORD:-}" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB:-mr_software}?schema=public"
fi

mkdir -p /var/mr-software/site-uploads/logo /var/mr-software/site-uploads/partners /var/mr-software/site-uploads/team
mkdir -p /var/mr-software/deployments
mkdir -p /app/public/brand/uploads/logo /app/public/brand/uploads/partners /app/public/brand/uploads/team

# Docker volumes mount as root — allow the app user to read/write uploads.
chown -R nextjs:nodejs /var/mr-software/site-uploads /var/mr-software/deployments /app/public/brand/uploads

exec gosu nextjs "$@"
