# AICUF Website - Docker Guide

## Build and Run with Docker

### Quick Start (Docker only)

1. **Build the image:**
```bash
docker build -t aicuf-website .
```

2. **Run the container:**
```bash
docker run -d \
  --name aicuf-web \
  -p 3000:3000 \
  --env-file .env \
  -v aicuf-uploads:/app/public/uploads \
  --restart unless-stopped \
  aicuf-website
```

3. **View logs:**
```bash
docker logs -f aicuf-web
```

4. **Stop container:**
```bash
docker stop aicuf-web
```

5. **Remove container:**
```bash
docker rm aicuf-web
```

## Environment Variables

Make sure your `.env` file is configured before running:

```bash
cp .env.example .env
# Edit .env with your actual values
```

Or pass environment variables directly:

```bash
docker run -d \
  --name aicuf-web \
  -p 3000:3000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e ADMIN_TOKEN="your-token" \
  -e ADMIN_USERNAME="admin" \
  -e ADMIN_PASSWORD="password" \
  -v aicuf-uploads:/app/public/uploads \
  aicuf-website
```

## Access

- Application: http://localhost:3000
- Admin Panel: http://localhost:3000/admin/login

## Production Deployment

### Push to Docker Registry

```bash
# Tag image
docker tag aicuf-website:latest your-registry/aicuf-website:latest

# Push to registry
docker push your-registry/aicuf-website:latest
```

### Deploy on Production Server

```bash
# Pull image
docker pull your-registry/aicuf-website:latest

# Run container
docker run -d \
  --name aicuf-web \
  -p 80:3000 \
  --env-file .env.production \
  -v /var/aicuf/uploads:/app/public/uploads \
  --restart unless-stopped \
  your-registry/aicuf-website:latest
```

## Common Commands

**Rebuild image:**
```bash
docker build --no-cache -t aicuf-website .
```

**Restart container:**
```bash
docker restart aicuf-web
```

**View container stats:**
```bash
docker stats aicuf-web
```

**Execute commands inside container:**
```bash
docker exec -it aicuf-web sh
```

**Check uploaded files:**
```bash
docker exec -it aicuf-web ls -la /app/public/uploads/noc
```

## Troubleshooting

**Container fails to start:**
```bash
docker logs aicuf-web
```

**Check if container is running:**
```bash
docker ps -a
```

**Remove old containers and images:**
```bash
docker rm aicuf-web
docker rmi aicuf-website
```

**Permission issues with uploads:**
```bash
docker exec -it aicuf-web ls -la /app/public/uploads
```
