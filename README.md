# 🏫 EduFix — School Facility Condition Reporting & Repair Tracking Portal

A production-ready, **single full-stack Next.js 15** application that lets parents, teachers,
maintenance staff and administrators **report, track, manage and resolve** school infrastructure
issues with full transparency and accountability.

> Built as one Next.js 15 (App Router) codebase — **no separate backend server**. All APIs are
> Next.js Route Handlers (`/app/api/*`); all database access happens directly inside the app.

---

## ✨ Highlights

- **Single command to run** — `npm install && npm run dev`. No external services required.
- **Zero-config database** — uses an automatic in-memory MongoDB and **auto-seeds** demo data
  (20 users, 10 staff, 50 issues) on first run. Point `MONGODB_URI` at MongoDB Atlas for production.
- **Zero-config uploads** — images/videos saved to local disk by default; switch to **Cloudinary**
  by setting three env vars.
- **JWT auth** with access + refresh tokens in httpOnly cookies, bcrypt hashing, and
  **role-based access control** (Parent, Teacher, Admin, Maintenance Staff).
- **8+ interconnected pages**, light/dark themes, fully responsive, accessible.
- **Real analytics** (Recharts), **PDF/Excel report export**, **near-real-time notifications**.
- **Typed end-to-end** with TypeScript, validated with Zod, tested with Jest.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 15** (App Router, Route Handlers, Server Components) |
| Language | TypeScript |
| UI | Tailwind CSS, ShadCN-style components (Radix UI), lucide-react |
| Data fetching | TanStack Query |
| Forms & validation | React Hook Form + Zod |
| Charts | Recharts |
| Database | MongoDB + **Mongoose** (in-memory fallback via `mongodb-memory-server`) |
| Auth | JWT (jose) + bcryptjs, httpOnly cookies, RBAC |
| File upload | Local disk **or** Cloudinary (auto-detected) |
| Reports | pdfkit (PDF), exceljs (Excel) |
| Testing | Jest + ts-jest |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (optional) copy env — the app runs fine without this
cp .env.example .env.local

# 3. Run the app (auto-seeds demo data on first DB connection)
npm run dev
```

Open **http://localhost:3000**.

### 🔑 Demo Accounts

The login page has one-click buttons to autofill these:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@edufix.edu` | `Admin@123` |
| **Teacher** | `teacher1@edufix.edu` | `Password@123` |
| **Parent** | `parent1@edufix.edu` | `Password@123` |
| **Staff** | `staff1@edufix.edu` | `Staff@123` |

> Other sample users follow the pattern `parent2..`, `teacher2..`, `staff2..staff10@edufix.edu`.

---

## 📄 Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing (hero, features, how-it-works, stats, benefits, testimonials, contact) | Public |
| `/login`, `/register`, `/forgot-password` | Authentication | Public |
| `/dashboard` | KPIs, analytics, recent activity, quick actions | All roles |
| `/report-issue` | Issue reporting form with media upload & preview | Parent, Teacher, Admin |
| `/tracking` | Searchable/filterable issue table + detail (timeline, evidence, comments) | All roles (scoped) |
| `/notifications` | Notifications with mark-as-read / delete / counter | All roles |
| `/analytics` | Charts: category, priority, monthly trend, resolution time, engagement | Admin |
| `/admin` | Issue management, user management, staff management, report export | Admin |

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── (auth)/                # Login, register, forgot-password (+ layout)
│   ├── (dashboard)/           # Authenticated app shell + pages
│   │   ├── dashboard/  report-issue/  tracking/
│   │   ├── notifications/  analytics/  admin/
│   ├── api/                   # Route Handlers (REST API)
│   │   ├── auth/ (login, register, logout, me, forgot-password)
│   │   ├── issues/ (+ [id], comments, media)
│   │   ├── notifications/ (+ [id])
│   │   ├── users/, staff/, dashboard/stats, analytics, reports, upload
│   ├── layout.tsx, page.tsx, globals.css
├── components/                # UI primitives, dashboard shell, admin, charts
├── context/                   # Auth context
├── hooks/                     # TanStack Query hooks, toast
├── lib/                       # db, env, auth (jwt/password/session), api helpers, validation
├── models/                    # Mongoose models: User, Issue, Notification, ActivityLog
├── services/                  # Business logic (controller→service→repository pattern)
└── types/                     # Shared TypeScript types
scripts/seed.ts                # CLI seed runner
tests/                         # Jest unit + integration tests
docs/                          # API.md, DEPLOYMENT.md, ENVIRONMENT.md
```

The backend follows a layered architecture: **Route Handler (controller) → Service → Model
(repository)**, keeping HTTP concerns, business rules and persistence cleanly separated.

---

## 🧱 Data Model

- **User** — name, email, password (hashed), role, schoolId, status, staff fields (specialization, assignments)
- **Issue** — issueCode, title, description, category, location (building/floor/room), priority, status,
  media[], reportedBy, assignedStaff, estimatedResolutionDate, resolutionNotes, comments[]
- **Notification** — userId, type, title, message, issueId, isRead
- **ActivityLog** — issueId, action, message, performedBy, timestamp

**Status flow:** `Pending → Assigned → In Progress → Resolved` (transitions are validated server-side).

---

## 🔌 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server (auto-seeds in-memory DB) |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run seed` | Seed a **persistent** DB (set `MONGODB_URI` first) |
| `npm test` | Run the Jest test suite |
| `npm run test:coverage` | Run tests with coverage |

---

## 🔐 Security

JWT auth (access + refresh), bcrypt password hashing, RBAC guards on every protected route,
Zod input validation/sanitization, httpOnly + SameSite cookies (Secure in production), file-type
and size validation on uploads, and no secrets in source (all via env vars). See
[`docs/`](docs/) for details.

---

## 📚 Documentation

- [Environment setup](docs/ENVIRONMENT.md)
- [API reference](docs/API.md)
- [Deployment guide](docs/DEPLOYMENT.md)

---

## 📝 Notes & Trade-offs

- **Real-time:** notifications use efficient polling via TanStack Query (every 20s) plus an unread
  counter, which fits the single-Next.js / serverless deployment model (Vercel) better than a
  long-lived Socket.io server. The data model and API are ready for a websocket upgrade if a
  persistent server is used.
- **In-memory DB:** great for instant demos, but data resets when the dev server restarts. For a
  persistent demo or production, set `MONGODB_URI` (local MongoDB or MongoDB Atlas).
- **Email:** forgot-password returns success without enumerating accounts; wiring an email provider
  (Resend/SES) is the only remaining step for live password resets.

---

## 📦 License

MIT — built for educational institutions, government stakeholders and evaluators.
