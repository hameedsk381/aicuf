#!/bin/bash
# Docker run command with persistent volumes for data and uploads

# Build the image
docker build -t aicuf-website .

# Stop and remove existing containers if they exist
docker stop aicuf-postgres aicuf-website 2>/dev/null
docker rm aicuf-postgres aicuf-website 2>/dev/null

# Create network if it doesn't exist
docker network create aicuf-network 2>/dev/null

# Start PostgreSQL
echo "Starting PostgreSQL..."
docker run -d \
  --name aicuf-postgres \
  --network aicuf-network \
  -v aicuf-postgres-data:/var/lib/postgresql/data \
  -e POSTGRES_USER=aicuf \
  -e POSTGRES_PASSWORD=aicuf_password \
  -e POSTGRES_DB=aicuf \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:16-alpine

echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Run web application
echo "Starting web application..."
docker run -d \
  --name aicuf-website \
  --network aicuf-network \
  -p 3000:3000 \
  -v aicuf-uploads:/app/public/uploads \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://aicuf:aicuf_password@aicuf-postgres:5432/aicuf \
  --env-file .env \
  --restart unless-stopped \
  aicuf-website

echo ""
echo "Containers started successfully!"
echo "Persistent volumes:"
echo "  - aicuf-postgres-data (PostgreSQL database)"
echo "  - aicuf-uploads (User uploaded files)"
echo ""
echo "Access the application at: http://localhost:3000"
echo "PostgreSQL is available at: localhost:5432"
