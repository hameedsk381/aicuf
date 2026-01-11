# APTSAICUF Website

Andhra-Telangana All India Catholic University Federation website.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT & WebAuthn (Passkeys)
- **Storage**: MinIO (S3 Compatible)
- **Styling**: Tailwind CSS

## Getting Started

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Setup environment variables:**
   Copy `.env.example` (if available) or create a `.env` file with:
   ```env
   DATABASE_URL=postgresql://...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   JWT_SECRET=your-secret
   ```

3. **Run migrations:**
   ```bash
   bun run db:migrate
   ```

4. **Start development server:**
   ```bash
   bun run dev
   ```

## Key Features

- **Voter Registration**: Register voters with device-based passkeys for secure voting.
- **Member Registration**: Standard email/password registration for federation members.
- **Admin Dashboard**: Manage registrations, nominations, and contacts.

## Documentation

- [Deployment Guide](./DEPLOYMENT.md) - How to deploy on Dokploy.
- [Docker Guide](./DOCKER.md) - Running the app with Docker.
- [Passkey Explanation](./PASSKEY_EXPLANATION.md) - How WebAuthn works in this project.
- [Passkey Troubleshooting](./PASSKEY_TROUBLESHOOTING.md) - Common issues and fixes for passkeys.

## Database Management

- `bun run db:generate`: Generate new migration files after schema changes.
- `bun run db:migrate`: Apply migrations to the database.
- `bun run db:push`: Push local schema directly to the database (use with caution).
- `bun run db:studio`: Explore the database with Drizzle Studio.
