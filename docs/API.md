# API Reference

All endpoints are Next.js **Route Handlers** under `/app/api`. They are REST-style JSON APIs.

## Conventions

- **Base URL:** `/api`
- **Auth:** httpOnly cookies (`edufix_access`, `edufix_refresh`) set on login/register.
- **Response envelope:**
  ```json
  { "success": true,  "data": { ... } }
  { "success": false, "error": "message", "details": { ... } }
  ```
- **Status codes:** `200` ok · `201` created · `400/422` validation · `401` unauthenticated ·
  `403` forbidden · `404` not found · `409` conflict · `500` server error.
- **Roles:** `parent`, `teacher`, `staff`, `admin`.

---

## Auth

| Method | Endpoint | Auth | Body / Notes |
|--------|----------|------|--------------|
| POST | `/api/auth/register` | Public | `{ name, email, password, confirmPassword, role: "parent"\|"teacher" }` → sets cookies |
| POST | `/api/auth/login` | Public | `{ email, password, remember? }` → sets cookies |
| POST | `/api/auth/logout` | Public | Clears cookies |
| GET | `/api/auth/me` | Cookie | Returns the current user |
| POST | `/api/auth/forgot-password` | Public | `{ email }` → always returns success |

---

## Issues

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/issues` | Any | Query: `category, status, priority, search, from, to, page, limit, mine`. Parents/teachers are scoped to their own issues. |
| POST | `/api/issues` | Any | Create. Body: `{ title, description, category, building, floor, roomNumber, priority, media[] }` |
| GET | `/api/issues/:id` | Any (scoped) | Returns `{ issue, activity }` |
| PATCH | `/api/issues/:id` | Admin, Staff | `{ status?, priority?, assignedStaff?, estimatedResolutionDate?, resolutionNotes? }` (status transitions validated) |
| POST | `/api/issues/:id/comments` | Any (scoped) | `{ text }` |
| POST | `/api/issues/:id/media` | Any | `{ media: [{ url, type, publicId?, filename? }] }` |

---

## Notifications

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/notifications` | Any | Query `?unread=true` optional. Returns `{ items, unreadCount }` |
| PATCH | `/api/notifications` | Any | Mark **all** as read |
| PATCH | `/api/notifications/:id` | Any | Mark one as read |
| DELETE | `/api/notifications/:id` | Any | Delete one |

---

## Users (admin)

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/users` | Admin | Query: `role, status, search, page, limit` |
| PATCH | `/api/users/:id` | Admin / self | `{ status }` (admin) or `{ name, phone, profileImage }` (self) |

## Staff

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/staff` | Admin, Staff | Returns staff with live `activeAssignments` |
| POST | `/api/staff` | Admin | `{ name, email, phone?, specialization, password? }` (default `Staff@123`) |
| PATCH | `/api/staff/:id` | Admin | `{ name?, phone?, specialization?, status? }` |

---

## Dashboard & Analytics

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/dashboard/stats` | Any | KPI cards + status counts + recent issues (role-scoped) |
| GET | `/api/analytics` | Any | Category/priority/status/monthly/resolution-time data + engagement |

## Reports (admin)

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/reports?type=&format=` | Admin | `type=issues\|resolution\|monthly`, `format=pdf\|excel` → file download |

## Upload

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/upload` | Any | `multipart/form-data` with `files` (≤10). Returns `{ media: [...] }`. Cloudinary if configured, else local disk. |

---

## Example

```bash
# Login (stores cookies in jar)
curl -c jar.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@edufix.edu","password":"Admin@123"}'

# List issues
curl -b jar.txt "http://localhost:3000/api/issues?status=Pending&limit=5"
```
