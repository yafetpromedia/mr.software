#!/bin/sh
set -e

mkdir -p /var/mr-software/site-uploads/logo /var/mr-software/site-uploads/partners /var/mr-software/site-uploads/team
mkdir -p /var/mr-software/deployments
mkdir -p /app/public/brand/uploads/logo /app/public/brand/uploads/partners /app/public/brand/uploads/team

# Docker volumes mount as root — allow the app user to read/write uploads.
chown -R nextjs:nodejs /var/mr-software/site-uploads /var/mr-software/deployments /app/public/brand/uploads

exec gosu nextjs "$@"
