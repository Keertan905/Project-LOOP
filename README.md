# Project LOOP 🔁
### AI Customer-Feedback Intelligence Platform

Project LOOP is a corporate-grade, multi-tenant web application designed to help product managers, support leads, and founders make sense of customer feedback. The platform ingests feedback from multiple channels, uses AI to classify and cluster the content, surfaces key trends, and answers questions in plain English grounded strictly in actual customer feedback records.

---

## 🚀 Key Features

* **Multi-Tenant Workspaces:** Complete data isolation per workspace to ensure a user in one company can never access another's data.
* **Role-Based Access Control (RBAC):** Three predefined roles (`ADMIN`, `ANALYST`, `VIEWER`) that control who can ingest, analyze, edit, or view feedback data.
* **Feedback Ingestion:** Supports manual single entry, simulated external channels, and CSV bulk uploads.
* **Fast Feedback Inbox:** Server-side paginated tables with advanced full-text search and filtering by channel, sentiment, theme, status, and date range.
* **Interactive Analytics Dashboard:** Real-time metrics powered by Recharts (volume over time, sentiment breakdown, and top recurring themes).
* **AI Classification & Clustering:** Automatic categorization on ingest (sentiment, score, matching themes, feature area, and classification rationale).
* **Ask LOOP (Grounded RAG):** Interactive AI search chat grounded strictly in workspace feedback to prevent hallucinations.
* **Voice-of-Customer (VoC) Reports:** Pre-computed periodic reports compiling narratives, sentiment shifts, verbatim quotes, and recommended actions.

---

## 🛠️ Technology Stack

* **Framework:** Next.js 15 (App Router) + TypeScript
* **Styling:** Tailwind CSS (Modern premium UI)
* **Database:** PostgreSQL (Supabase / Neon)
* **ORM:** Prisma
* **Authentication:** NextAuth (Auth.js)
* **AI Engine:** Groq SDK (Llama 3.3 70B model) with a rule-based deterministic fallback engine
* **Charts:** Recharts
* **Validation:** Zod
* **Deployment:** Vercel

---

## 📂 Repository Structure

The project directory structure follows Next.js App Router best practices:

```text
loop/
 ├── app/
 │    ├── (auth)/             # Login and signup views
 │    ├── (app)/              # Dashboard layout and pages
 │    │    ├── dashboard/
 │    │    │    ├── ask/      # Grounded RAG Chat interface
 │    │    │    ├── inbox/    # Feedback Inbox list & filters
 │    │    │    ├── ingest/   # Feed manual/CSV bulk upload
 │    │    │    ├── members/  # Admin user management
 │    │    │    ├── reports/  # VoC Digest generator
 │    │    │    ├── settings/ # Workspace settings
 │    │    │    └── trends/   # Theme trends charts
 │    └── api/                # Route handlers (auth, feedback, insights, reports)
 ├── components/              # Shared UI components
 ├── lib/                     # Utilities (AI prompt engine, search retriever, auth, prisma)
 ├── prisma/                  # Prisma schema and seed scripts
 └── public/                  # Static assets
```

---

## ⚙️ Getting Started & Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 LTS or newer)
* [Git](https://git-scm.com/)
* A PostgreSQL database instance (Neon or Supabase free tier)

### 2. Installation
Clone the repository and install dependencies:
```bash
# Install package dependencies
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (matching `.env.example`) and fill in your connection strings:
```env
# PostgreSQL connection strings
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<db_name>?pgbouncer=true"
DIRECT_URL="postgresql://<username>:<password>@<host>:<port>/<db_name>"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-key"

# AI engine key (Optional fallback mode is enabled if not provided)
GROQ_API_KEY="your-groq-api-key"
```

### 4. Database Setup & Seeding
Prepare your database schema and populate it with 120+ mock feedback entries:
```bash
# Run database migrations
npx prisma migrate dev --name init

# Run seed script to set up demo workspaces and roles
npm run seed
```

### 5. Running the Application
Start the Next.js development server locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔑 Demo Credentials Checklist

The seed script pre-populates a demo workspace (`Acme Corp`) with three roles to test the RBAC validation. Use the credentials below to log in:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@loop.com` | `Password123` | Full control (manage members, invite users, ingest feedback, generate VoC reports, view inbox). |
| **Analyst** | `analyst@loop.com` | `Password123` | Write access (ingest feedback, reclassify items, compile reports, view inbox). |
| **Viewer** | `viewer@loop.com` | `Password123` | Read-only access (view dashboard charts, view inbox items, run grounded Q&A). |

---

## 🔒 Security & Data Isolation Policy

* Every query that touches `Feedback`, `Theme`, `Embedding`, `Report`, or `User` records filters specifically on the authenticated user's `workspaceId`.
* Business logic is decoupled from UI components and handled server-side in API route handlers.
* Secure role verification is performed on all mutation endpoints (`POST`, `PUT`, `DELETE` operations check permissions using `lib/permissions.ts` before database writes).
