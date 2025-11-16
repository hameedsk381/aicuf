#!/bin/sh
set -e

echo "🚀 Starting application..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
MAX_RETRIES=30
RETRY_COUNT=0

until nc -z ${DATABASE_HOST:-postgres} ${DATABASE_PORT:-5432} 2>/dev/null || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "  PostgreSQL is unavailable - attempt $RETRY_COUNT/$MAX_RETRIES"
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ PostgreSQL failed to become available after $MAX_RETRIES attempts"
  echo "⚠️  Starting application anyway..."
else
  echo "✅ PostgreSQL is ready!"
  
  # Run migrations
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
