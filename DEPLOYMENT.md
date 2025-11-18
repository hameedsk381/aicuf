# Deployment Guide for Dokploy

## Prerequisites
- Dokploy instance running
- Domain with SSL configured
- Database accessible from Dokploy instance

## Environment Variables

Set these in Dokploy's environment configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication - CRITICAL: Generate strong secret
JWT_SECRET=<use: openssl rand -base64 32>

# Site Configuration - MUST be your actual domain with HTTPS
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Node Environment
NODE_ENV=production
```

## Deployment Steps

### 1. Push Code to Repository
```bash
git add .
git commit -m "Production ready deployment"
git push origin main
```

### 2. In Dokploy Dashboard

1. **Create New Application**
   - Type: Git Repository
   - Repository: Your GitHub/GitLab URL
   - Branch: main

2. **Set Build Configuration**
   - Build Command: `bun install && bun run build`
   - Start Command: `bun start`
   - Port: 3000

3. **Configure Environment Variables**
   - Add all variables from `.env` to Dokploy
   - **CRITICAL**: Set `NEXT_PUBLIC_SITE_URL` to your actual domain with HTTPS

4. **Database Setup**
   - If using Dokploy's PostgreSQL: Link database
   - If external: Add `DATABASE_URL` to env vars
   - Database migrations run automatically on startup via `npm run db:push`

5. **Deploy**
   - Click "Deploy" button
   - Monitor build logs for errors
   - Check deployment status

### 3. Post-Deployment Verification

Visit your domain and test:
- [ ] Site loads over HTTPS
- [ ] Registration with password works
- [ ] Email/password login works
- [ ] **Register NEW passkey** (localhost passkeys won't work)
- [ ] Passkey login works
- [ ] Dashboard accessible
- [ ] Logout works

## Important Notes

> **⚠️ Passkey Migration**
> Passkeys registered on localhost WILL NOT work in production. All users must re-register their passkeys on the production domain.

> **🔒 Security**
> - HTTPS is mandatory for passkeys
> - Generate strong JWT_SECRET: `openssl rand -base64 32`
> - Never commit `.env` files

## Database Migrations

Migrations happen automatically via the `postinstall` script in `package.json`:
```json
"postinstall": "bun run db:push"
```

This runs `drizzle-kit push` which applies schema changes to the database.

## Troubleshooting

### Passkey Registration Fails
- **Check**: `NEXT_PUBLIC_SITE_URL` matches your actual domain
- **Check**: Site is accessible via HTTPS
- **Browser Console**: Look for WebAuthn errors

### Database Connection Issues
- **Verify**: `DATABASE_URL` is correct
- **Check**: Database is accessible from Dokploy instance
- **Test**: Run `bun run scripts/check-passkeys-db.ts` locally

### Build Fails
- **Check**: All dependencies in `package.json`
- **Review**: Build logs in Dokploy
- **Verify**: No TypeScript errors

## Rollback

If deployment fails:
1. Go to Dokploy deployments tab
2. Select previous working deployment
3. Click "Rollback"

## Support

Check logs in Dokploy:
- Build logs: For compilation errors
- Application logs: For runtime errors
- Database logs: For connection issues
