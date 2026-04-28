#!/usr/bin/env bash
# Pull latest code, install deps, run migrations, rebuild, restart PM2.
# Usage on the server:  cd /var/www/levelupingermany/current && ./deploy/update.sh
set -euo pipefail

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Installing dependencies (production)"
npm ci --omit=dev=false

echo "==> Running Prisma migrations"
npx prisma migrate deploy
npx prisma generate

echo "==> Building Next.js"
npm run build

echo "==> Reloading PM2"
pm2 reload levelupingermany --update-env

echo "==> Done. Health check:"
sleep 2
curl -fsS -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000 || true
