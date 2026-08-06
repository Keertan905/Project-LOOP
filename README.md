# Project LOOP 🔁
### AI Customer-Feedback Intelligence Platform

Project LOOP is a corporate-grade, multi-tenant web application designed to help product managers, support leads, and founders make sense of customer feedback. The platform ingests feedback from multiple channels, uses AI to classify and cluster content, surfaces key trends, and answers questions in plain English grounded strictly in actual customer feedback records.

---

## 🚀 Key Features

* **Multi-Tenant Workspaces & Data Isolation:** Complete data isolation per workspace to ensure users in one company never access another's data.
* **Role-Based Access Control (RBAC):** Predefined roles (`ADMIN`, `ANALYST`, `VIEWER`) controlling access to ingest, analyze, edit, or view data.
* **Tokenized Workspace Invitations:** Secure invite link generation (`/invite?token=...`) with an interactive invitation popup dialog.
* **Categorized Navigation Sidebar:** Structured sections (`FEEDBACK`, `AI INTELLIGENCE`, `ANALYTICS`, `WORKSPACE`).
* **Top Header Utilities:** Global search bar `(press '/' to focus...)`, notification bell badge, and `app.loop.ai` breadcrumb trail.
* **6-Metric Dashboard & Activity Feed:** Real-time metrics (`TOTAL`, `NEW`, `REVIEWED`, `ACTIONED`, `ASSIGNED`, `UNASSIGNED`) alongside a live **Workspace Activity Feed**.
* **Fast Feedback Inbox:** Server-side paginated tables with full-text search and filtering by channel, sentiment, theme, status, and date range.
* **AI Classification & Clustering:** Automatic categorization on ingest (sentiment, score, matching themes, feature area, and classification rationale).
* **Ask LOOP (Grounded RAG):** Interactive AI search chat grounded strictly in workspace feedback to prevent hallucinations.
* **Voice-of-Customer (VoC) Reports:** Pre-computed periodic reports compiling narratives, sentiment shifts, verbatim quotes, and recommended actions.

---

## 🔒 Security & Production Hardening

LOOP incorporates production-ready engineering patterns:

* **Sliding-Window Rate Limiting:** Enforced via [lib/rate-limit.ts](file:///c:/Users/keert/OneDrive/Desktop/Loopvs/loop/lib/rate-limit.ts) across API routes:
  - `/api/auth/*` & `/api/signup`: 10 req / min (protects against credential brute-forcing).
  - `/api/insights/*` & `/api/reports`: 20 req / min (protects AI model token budgets).
  - General `/api/*`: 100 req / min.
* **Security Response Headers:** Configured in [middleware.ts](file:///c:/Users/keert/OneDrive/Desktop/Loopvs/loop/middleware.ts) (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`).
* **High-Performance Vector Indexing:** Includes PostgreSQL `HNSW` vector index migration (`vector_cosine_ops`) for $O(\log N)$ semantic similarity search over `Embedding(vector)`.
* **Structured JSON Logging:** Emits standardized JSON logs ([lib/logger.ts](file:///c:/Users/keert/OneDrive/Desktop/Loopvs/loop/lib/logger.ts)) with timestamps, severity levels, and error stack traces.
* **System Health Diagnostics:** Public diagnostic probe endpoint at `GET /api/health` checking active database connectivity (`SELECT 1`), latency, and uptime.
* **In-Memory TTL Caching:** Implements query result caching in [lib/cache.ts](file:///c:/Users/keert/OneDrive/Desktop/Loopvs/loop/lib/cache.ts) to minimize database query overhead.

---

## 🛠️ Technology Stack

* **Framework:** Next.js 15 (App Router) + TypeScript
* **Styling:** Tailwind CSS (Modern dark SaaS aesthetic)
* **Database:** PostgreSQL (`pgvector` for AI embeddings)
* **ORM:** Prisma
* **Authentication:** NextAuth (Auth.js)
* **AI Engine:** Groq SDK (Llama 3.3 70B model) with a rule-based deterministic fallback engine
* **Charts:** Recharts
* **Validation:** Zod

---

## 📂 Repository Structure

```text
loop/
 ├── app/
 │    ├── (auth)/             # Login and signup views
 │    ├── invite/             # Tokenized workspace invite onboarding page
 │    ├── dashboard/
 │    │    ├── ask/           # Grounded RAG Chat interface
 │    │    ├── inbox/         # Feedback Inbox list & filters
 │    │    ├── ingest/        # Manual entry & CSV bulk upload
 │    │    ├── members/       # Team Directory & Workspace Invites
 │    │    ├── reports/       # VoC Digest generator
 │    │    ├── settings/      # Workspace settings
 │    │    └── trends/        # Theme clusters & trends
 │    └── api/                # Route handlers (auth, feedback, health, insights, invite, reports)
 ├── components/              # Shared UI components (DashboardShell, SidebarNav, DashboardCharts)
 ├── lib/                     # Core utilities (AI prompt engine, search retriever, logger, rate-limit, cache, auth)
 ├── prisma/                  # Prisma schema, migrations (HNSW index), and seed script
 └── public/                  # Static assets
```

---

## ⚙️ Getting Started & Setup

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 LTS or newer)
* [Git](https://git-scm.com/)
* A PostgreSQL instance with `pgvector` support (Supabase / Neon)

### 2. Installation
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# PostgreSQL connection strings
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<db_name>?pgbouncer=true"
DIRECT_URL="postgresql://<username>:<password>@<host>:<port>/<db_name>"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-key"

# AI Engine Key
GROQ_API_KEY="your-groq-api-key"
```

### 4. Database Setup & Seeding
```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# Seed demo workspace and mock feedback records
npx tsx prisma/seed.ts
```

### 5. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials Checklist

The seed script pre-populates a demo workspace with three RBAC roles:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@loop.com` | `Password123` | Full control (manage members, invite users, ingest feedback, generate reports). |
| **Analyst** | `analyst@loop.com` | `Password123` | Write access (ingest feedback, reclassify items, compile reports). |
| **Viewer** | `viewer@loop.com` | `Password123` | Read-only access (view dashboard charts, view inbox items, run grounded Q&A). |

---

## 🏥 Health & Observability

You can verify application and database connectivity at any time via:
```bash
curl http://localhost:3000/api/health
```
Response:
```json
{
  "status": "ok",
  "uptime": 124.5,
  "timestamp": "2026-08-06T20:21:49.000Z",
  "database": {
    "status": "connected",
    "latencyMs": 4
  },
  "environment": "development"
}
```
