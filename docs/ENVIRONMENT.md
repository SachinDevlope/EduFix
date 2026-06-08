# Environment Setup Guide

EduFix runs **out of the box with no configuration**. Every variable below is optional for local
development — defaults keep the app fully functional (in-memory database, local-disk uploads,
auto-seeded demo data).

## 1. Prerequisites

- **Node.js 18.18+** (Node 20/22 recommended)
- npm 9+

## 2. Install & run

```bash
npm install
npm run dev      # http://localhost:3000
```

On first request the app connects to an **in-memory MongoDB** and **auto-seeds** demo data
(20 users, 10 staff, 50 issues).

## 3. Environment variables

Copy `.env.example` to `.env.local` and edit as needed:

```bash
cp .env.example .env.local
```

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | _(empty)_ | If empty, an in-memory MongoDB is used. Set to a MongoDB Atlas/local URI for persistence. |
| `AUTO_SEED` | `true` | Auto-seed demo data when the database is empty. |
| `JWT_ACCESS_SECRET` | dev default | Secret for access tokens. **Change in production.** |
| `JWT_REFRESH_SECRET` | dev default | Secret for refresh tokens. **Change in production.** |
| `JWT_ACCESS_EXPIRES_MIN` | `15` | Access token lifetime (minutes). |
| `JWT_REFRESH_EXPIRES_DAYS` | `7` | Refresh token lifetime (days). |
| `CLOUDINARY_CLOUD_NAME` | _(empty)_ | Set all three Cloudinary vars to enable cloud uploads. |
| `CLOUDINARY_API_KEY` | _(empty)_ | |
| `CLOUDINARY_API_SECRET` | _(empty)_ | |
| `MAX_FILE_SIZE_MB` | `25` | Per-file upload limit. |
| `SEED_ADMIN_EMAIL` | `admin@edufix.edu` | Seed admin login. |
| `SEED_ADMIN_PASSWORD` | `Admin@123` | Seed admin password. |

## 4. Using a persistent database (MongoDB Atlas)

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. Create a database user and allow your IP (or `0.0.0.0/0` for demos).
3. Copy the connection string and set it in `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/edufix?retryWrites=true&w=majority
   ```
4. Seed the persistent database:
   ```bash
   npm run seed
   ```
5. Run `npm run dev`. Your data now survives restarts.

## 5. Enabling Cloudinary uploads

Set all three `CLOUDINARY_*` variables. The upload service auto-detects them and routes media to
Cloudinary; otherwise files are written to `public/uploads/`.

## 6. Production secrets

Before deploying, generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Set the output as `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
