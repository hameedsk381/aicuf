# PowerShell script for Docker deployment with persistent volumes

# Build the image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t aicuf-website .

# Stop and remove existing containers if they exist
Write-Host "Stopping existing containers if any..." -ForegroundColor Yellow
docker stop aicuf-postgres aicuf-website 2>$null
docker rm aicuf-postgres aicuf-website 2>$null

# Create network if it doesn't exist
docker network create aicuf-network 2>$null

# Start PostgreSQL
Write-Host "Starting PostgreSQL..." -ForegroundColor Green
docker run -d `
  --name aicuf-postgres `
  --network aicuf-network `
  -v aicuf-postgres-data:/var/lib/postgresql/data `
  -e POSTGRES_USER=aicuf `
  -e POSTGRES_PASSWORD=aicuf_password `
  -e POSTGRES_DB=aicuf `
  -p 5432:5432 `
  --restart unless-stopped `
  postgres:16-alpine

Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Run web application
Write-Host "Starting web application..." -ForegroundColor Green
docker run -d `
  --name aicuf-website `
  --network aicuf-network `
  -p 3000:3000 `
  -v aicuf-uploads:/app/public/uploads `
  -e NODE_ENV=production `
  -e DATABASE_URL=postgresql://aicuf:aicuf_password@aicuf-postgres:5432/aicuf `
  --env-file .env `
  --restart unless-stopped `
  aicuf-website

Write-Host "`nContainers started successfully!" -ForegroundColor Green
Write-Host "Persistent volumes:" -ForegroundColor Cyan
Write-Host "  - aicuf-postgres-data (PostgreSQL database)" -ForegroundColor White
Write-Host "  - aicuf-uploads (User files at /app/public/uploads)" -ForegroundColor White
Write-Host "`nAccess the application at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "PostgreSQL is available at: localhost:5432" -ForegroundColor Yellow
