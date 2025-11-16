#!/bin/sh
set -e

echo "🚀 Starting application..."

# Check if DATABASE_URL is configured properly (not placeholder)
if [ -z "$DATABASE_URL" ] || echo "$DATABASE_URL" | grep -q "user:password@host:port"; then
  echo "⚠️  DATABASE_URL not configured or using placeholder"
  echo "⚠️  Skipping migrations - please set DATABASE_URL environment variable"
else
  # Run migrations (external PostgreSQL should already be available)
  echo "📦 Running database migrations..."
  if [ -f "/app/scripts/migrate.ts" ]; then
    bun run /app/scripts/migrate.ts
    if [ $? -eq 0 ]; then
      echo "✅ Migrations completed successfully"
    else
      echo "⚠️  Migrations failed, but continuing..."
    fi
  else
    echo "⚠️  No migration script found, skipping..."
  fi
fi

# Start the Next.js application
echo "🌐 Starting Next.js server..."
exec node server.js
