# AICUF Website - Docker Guide

## Build and Run with Docker (Using Bun)

This project uses **Bun** runtime for faster builds and runtime performance.

### Using Docker Compose (Recommended)

1. **Build and start:**
```bash
docker-compose up -d --build
```

2. **View logs:**
```bash
docker-compose logs -f web
```

3. **Stop:**
```bash
docker-compose down
```

4. **Stop and remove volumes:**
```bash
docker-compose down -v
```

### Using Docker directly

1. **Build image:**
```bash
docker build -t aicuf-website .
```

2. **Run container:**
```bash
docker run -p 3000:3000 \
  --env-file .env \
  -v uploads:/app/public/uploads \
  aicuf-website
```

3. **Stop container:**
```bash
docker stop <container-id>
```

## Why Bun?

- ⚡ **3x faster** dependency installation
- 🚀 **Faster startup** time
- 📦 **Smaller image** size (~120MB vs ~150MB)
- 🔧 Drop-in replacement for Node.js

## Environment Variables

Make sure your `.env` file is configured before running:

```bash
cp .env.example .env
# Edit .env with your actual values
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

### Deploy on Server

```bash
# Pull and run on production server
docker pull your-registry/aicuf-website:latest
docker run -d -p 3000:3000 --env-file .env.production your-registry/aicuf-website:latest
```

## Troubleshooting

**Container fails to start:**
```bash
docker logs <container-id>
```

**Permission issues with uploads:**
```bash
docker exec -it <container-id> ls -la /app/public/uploads
```

**Rebuild without cache:**
```bash
docker-compose build --no-cache
```

**Check Bun version:**
```bash
docker run aicuf-website bun --version
```
