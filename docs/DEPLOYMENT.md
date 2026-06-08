# Deployment Guide

EduFix is a single Next.js 15 app, so it deploys like any standard Next.js project — **frontend and
backend ship together**. The recommended target is **Vercel + MongoDB Atlas (+ optional Cloudinary)**.

## Prerequisites for production

1. **MongoDB Atlas** connection string (the in-memory DB is for local demos only).
2. Strong JWT secrets (see below).
3. _(Optional)_ Cloudinary account for persistent media storage — required on serverless hosts,
   since local-disk uploads are ephemeral there.

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Option A — Vercel (recommended)

1. Push the repository to GitHub/GitLab.
2. In Vercel, **New Project → Import** the repo. Framework preset: **Next.js** (auto-detected).
3. Add Environment Variables (Project → Settings → Environment Variables):

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | your Atlas URI |
   | `JWT_ACCESS_SECRET` | generated secret |
   | `JWT_REFRESH_SECRET` | generated secret |
   | `CLOUDINARY_CLOUD_NAME` | _(recommended)_ |
   | `CLOUDINARY_API_KEY` | _(recommended)_ |
   | `CLOUDINARY_API_SECRET` | _(recommended)_ |
   | `AUTO_SEED` | `false` (seed manually instead) |

4. **Deploy.** Vercel runs `next build` and hosts the API routes as serverless functions.
5. Seed the production database once (from your machine, with the same `MONGODB_URI`):
   ```bash
   npm run seed
   ```

> **Note:** On Vercel, set `CLOUDINARY_*` so uploads persist. Without it, files write to the
> function's ephemeral filesystem and won't survive.

---

## Option B — Node server (Render / Railway / VPS / Docker)

```bash
npm install
npm run build
npm run start      # serves on $PORT (default 3000)
```

Set the same environment variables in your host's dashboard. A long-lived Node server also lets you
keep local-disk uploads if you mount a persistent volume at `public/uploads`.

### Dockerfile (optional)

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## Post-deploy checklist

- [ ] `MONGODB_URI` points at Atlas and the IP allowlist includes your host (`0.0.0.0/0` for serverless).
- [ ] `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` are strong and unique.
- [ ] `AUTO_SEED=false` in production; seed once via `npm run seed`.
- [ ] Cloudinary configured (especially on serverless).
- [ ] App loads, login works with seeded admin, and `/admin` report export downloads.
- [ ] Cookies are `Secure` (automatic when `NODE_ENV=production`).

---

## Architecture recap

```
Browser ──▶ Next.js (Vercel/Node)
              ├─ React Server/Client Components (UI)
              └─ Route Handlers /app/api/*  ──▶  Mongoose ──▶ MongoDB Atlas
                                            └──▶  Cloudinary (media)
```

No separate backend deployment is required.
