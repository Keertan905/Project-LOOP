# PROJECT LOOP 🔁 — Complete Master Project Documentation

**Project LOOP** is a multi-tenant, AI-powered customer feedback intelligence web application. It ingests feedback across multiple channels, automatically classifies text using Large Language Models, tracks sentiment trend shifts and negative spike rates, supports zero-hallucination grounded RAG Q&A, and generates periodic Voice-of-Customer (VoC) executive reports.

---

## 📑 Table of Contents

1. [Executive Summary & Purpose](#1-executive-summary--purpose)
2. [Technology Stack & Architecture](#2-technology-stack--architecture)
3. [Repository Directory Structure](#3-repository-directory-structure)
4. [Database Schema & Data Model](#4-database-schema--data-model)
5. [Multi-Tenant Security & RBAC Policy](#5-multi-tenant-security--rbac-policy)
6. [AI Classification & Grounded RAG Engine](#6-ai-classification--grounded-rag-engine)
7. [API Routes Reference & Endpoints](#7-api-routes-reference--endpoints)
8. [Getting Started & Operational Guide](#8-getting-started--operational-guide)
9. [Slide-by-Slide PPT Presentation Deck](#9-slide-by-slide-ppt-presentation-deck)
10. [Video Demo Walkthrough & Testimonial Script](#10-video-demo-walkthrough--testimonial-script)
11. [Demo Credentials & Sample CSV Data](#11-demo-credentials--sample-csv-data)

---

## 1. Executive Summary & Purpose

Modern businesses collect feedback from disparate sources—support tickets, app store reviews, NPS surveys, community posts, and sales calls. Processing this data manually leads to inconsistent tagging, overlooked critical bugs, and delayed product responses.

### Key Value Propositions:
* **Multi-Tenant Data Isolation:** Complete logical isolation per workspace.
* **AI Auto-Classification:** Instant extraction of sentiment (`POS`/`NEU`/`NEG`), continuous scores (`-1.0` to `+1.0`), feature areas, theme tags, and AI rationale.
* **Hybrid Dual-Engine AI:** Uses Groq Cloud SDK (`llama-3.3-70b-versatile`) with an embedded deterministic fallback engine to guarantee 100% uptime.
* **Period-over-Period Analytics:** 15-day rolling analytics flagging sudden surges in negative customer feedback (+150% spike rates).
* **Grounded RAG Assistant:** Q&A strictly grounded in tenant database records to eliminate AI hallucinations.
* **Voice-of-Customer (VoC) Executive Digests:** One-click synthesis of executive narratives, verbatim quotes, and engineering action items.

---

## 2. Technology Stack & Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PROJECT LOOP ARCHITECTURE                        │
├───────────────────┬─────────────────────────────────────────────────────────┤
│ Core Framework    │ Next.js 15.5 (App Router, Turbopack, React 19)          │
│ Language & UI     │ TypeScript, Tailwind CSS, Lucide Icons                  │
│ Analytics Engine  │ Recharts Data Visualization Engine                      │
│ Database Layer    │ PostgreSQL (Supabase / Neon) + Prisma ORM               │
│ Authentication    │ NextAuth.js (JWT Sessions, Role-Based Access Control)   │
│ AI Intelligence   │ Groq Cloud API (Llama 3.3 70B) + Embedded Fallback      │
│ Ingestion Parser  │ PapaParse CSV Stream Processor                          │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 3. Repository Directory Structure

```text
loop/
 ├── app/
 │    ├── (auth)/             # Login and authentication views
 │    │    └── login/
 │    ├── dashboard/          # Protected dashboard views
 │    │    ├── ask/           # Grounded RAG Chat interface
 │    │    ├── inbox/         # Feedback Inbox list & filters
 │    │    ├── ingest/        # Feed manual/CSV bulk upload
 │    │    ├── members/       # Admin user management
 │    │    ├── reports/       # VoC Digest generator
 │    │    ├── settings/      # Workspace settings
 │    │    ├── trends/        # Theme trends charts & drilldowns
 │    │    ├── layout.tsx     # Dashboard shell & sidebar layout
 │    │    ├── loading.tsx    # React Suspense loading skeleton loader
 │    │    └── page.tsx       # Main dashboard overview metrics
 │    └── api/                # Next.js API route handlers
 │         ├── auth/          # NextAuth authentication endpoints
 │         ├── feedback/      # Single & bulk feedback CRUD routes
 │         ├── insights/      # Trend analysis endpoints
 │         ├── reports/       # VoC report generation endpoints
 │         └── users/         # User management endpoints
 ├── components/              # Reusable React UI components
 │    ├── DashboardShell.tsx  # Responsive sidebar & topbar container
 │    ├── FeedbackInbox.tsx   # Server-paginated feedback table
 │    ├── IngestionWizard.tsx # CSV parsing & ingestion wizard
 │    ├── SidebarNav.tsx      # Sidebar navigation links
 │    ├── ThemeTrends.tsx     # Recharts trend graphs & spike cards
 │    └── VoCReportView.tsx   # Rendered VoC executive report view
 ├── lib/                     # Core business logic & AI utilities
 │    ├── ai.ts               # Groq LLM classification & VoC report generator
 │    ├── auth.ts             # NextAuth credentials provider setup
 │    ├── groq.ts             # Groq SDK initialization
 │    ├── permissions.ts      # RBAC permission evaluation engine
 │    └── prisma.ts           # Prisma database client instance
 ├── prisma/
 │    ├── schema.prisma       # Database schema & model definitions
 │    └── seed.ts             # Database seed script (mock users & 120+ entries)
 ├── .env                     # Environment variables configuration
 ├── package.json             # NPM dependencies & scripts
 ├── README.md                # General readme file
 └── test_feedback.csv        # Sample CSV test dataset (21 rows)
```

---

## 4. Database Schema & Data Model

Defined in `prisma/schema.prisma`:

```prisma
enum Role {
  ADMIN
  ANALYST
  VIEWER
}

enum Sentiment {
  POS
  NEU
  NEG
}

enum FeedbackStatus {
  NEW
  IN_REVIEW
  RESOLVED
  ARCHIVED
}

model Workspace {
  id        String     @id @default(cuid())
  name      String
  slug      String     @unique
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  users     User[]
  feedbacks Feedback[]
  themes    Theme[]
  reports   Report[]
}

model User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String?
  password    String
  role        Role      @default(VIEWER)
  workspaceId String
  createdAt   DateTime  @default(now())

  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  reports     Report[]
}

model Feedback {
  id              String         @id @default(cuid())
  content         String
  channel         String
  customerLabel   String?
  sentiment       Sentiment      @default(NEU)
  sentimentScore  Float          @default(0.0)
  featureArea     String?
  rationale       String?
  status          FeedbackStatus @default(NEW)
  workspaceId     String
  createdAt       DateTime       @default(now())

  workspace       Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  feedbackThemes  FeedbackTheme[]
  embeddings      Embedding[]
}

model Theme {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String?
  workspaceId String

  workspace      Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  feedbackThemes FeedbackTheme[]
}

model FeedbackTheme {
  feedbackId String
  themeId    String

  feedback Feedback @relation(fields: [feedbackId], references: [id], onDelete: Cascade)
  theme    Theme    @relation(fields: [themeId], references: [id], onDelete: Cascade)

  @@id([feedbackId, themeId])
}

model Report {
  id          String   @id @default(cuid())
  title       String
  content     String   // JSON string containing VoC executive summary, quotes, recommendations
  periodStart DateTime
  periodEnd   DateTime
  workspaceId String
  createdById String
  createdAt   DateTime @default(now())

  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  generatedBy User      @relation(fields: [createdById], references: [id])
}

model Embedding {
  id         String   @id @default(cuid())
  feedbackId String
  vector     String   // Serialized float vector
  createdAt  DateTime @default(now())

  feedback Feedback @relation(fields: [feedbackId], references: [id], onDelete: Cascade)
}
```

---

## 5. Multi-Tenant Security & RBAC Policy

### Data Isolation
Every database query in API route handlers and server pages strictly enforces workspace boundaries:
```typescript
where: { workspaceId: session.user.workspaceId }
```

### Role Permissions Matrix
Evaluated via `lib/permissions.ts`:

| Permission Action | Admin | Analyst | Viewer |
| :--- | :---: | :---: | :---: |
| `read:feedback` (View Inbox & Trends) | ✅ | ✅ | ✅ |
| `read:reports` (View VoC Reports) | ✅ | ✅ | ✅ |
| `use:rag` (Ask LOOP Q&A) | ✅ | ✅ | ✅ |
| `write:feedback` (Ingest CSV / Single Entry) | ✅ | ✅ | ❌ |
| `manage:reports` (Generate VoC Reports) | ✅ | ✅ | ❌ |
| `manage:users` (Invite/Edit Workspace Members) | ✅ | ❌ | ❌ |
| `manage:workspace` (Edit Workspace Settings) | ✅ | ❌ | ❌ |

---

## 6. AI Classification & Grounded RAG Engine

### 6.1. Dual-Engine Classification Pipeline (`lib/ai.ts`)
1. **Primary Engine:** Passes feedback text to Groq Cloud SDK executing `llama-3.3-70b-versatile` with `response_format: { type: "json_object" }`.
2. **Fallback Engine:** If no `GROQ_API_KEY` is present or network limits occur, an embedded rule-based classifier evaluates sentiment lexicon (`posWords`, `negWords`) and matches keyword patterns to assign themes and feature areas.

### 6.2. Grounded RAG Assistant (`/dashboard/ask`)
* Retrieves top relevant customer feedback records for the user's workspace.
* Prompts Groq LLM with strict context constraints:
  ```text
  You are an AI assistant grounded strictly in workspace customer feedback.
  Answer the user's question using ONLY the provided feedback records.
  Do NOT invent features or facts not present in the feedback.
  ```

---

## 7. API Routes Reference & Endpoints

| Endpoint | Method | Role Req. | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/[...nextauth]` | `GET`, `POST` | Public | NextAuth session login & authentication handlers. |
| `/api/feedback` | `GET` | `read:feedback` | Server-paginated, filtered feedback list retrieval. |
| `/api/feedback` | `POST` | `write:feedback` | Ingest a single customer feedback item & trigger AI classification. |
| `/api/feedback/bulk` | `POST` | `write:feedback` | Ingest array of parsed CSV rows & auto-classify sequentially. |
| `/api/insights/trends` | `GET` | `read:feedback` | Returns theme counts, 15-day comparison volume, and spike rates. |
| `/api/reports` | `GET` | `read:reports` | Returns list of generated VoC reports. |
| `/api/reports` | `POST` | `manage:reports` | Generates a new VoC report using Groq AI for a date range. |
| `/api/users` | `GET`, `POST` | `manage:users` | Admin route to view and invite workspace team members. |

---

## 8. Getting Started & Operational Guide

### 8.1. Installation & Environment Setup
```bash
# 1. Clone repository & install dependencies
git clone https://github.com/your-org/loop.git
cd loop
npm install

# 2. Configure Environment Variables in .env
DATABASE_URL="postgresql://<user>:<password>@<host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://<user>:<password>@<host>:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-key"
GROQ_API_KEY="your-groq-api-key"
```

### 8.2. Database Setup & Seeding
```bash
# Push Prisma schema to your PostgreSQL database
npx prisma db push

# Seed database with demo workspace (Acme Corp), default users, and 120+ feedback entries
npx tsx prisma/seed.ts
```

### 8.3. Running the Server
```bash
# Start Next.js Development Server (with Turbopack)
npm run dev

# Or run Production Build
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 9. Slide-by-Slide PPT Presentation Deck

### Slide 1: Title Slide
* **Title:** Project LOOP 🔁 - AI Customer Feedback Intelligence Platform
* **Subtitle:** Transforming Unstructured Feedback into Product Strategy
* **Presenter:** [Your Name]
* **Speaker Notes:** *"Good day everyone! Today I am presenting Project LOOP—an enterprise platform that turns customer feedback into structured product insights."*

### Slide 2: Problem Statement
* **Key Points:** Data Fragmentation across channels, manual tagging errors, delayed bug discovery, generic AI hallucinations.
* **Speaker Notes:** *"Feedback overload is a major bottleneck. Processing CSVs manually leads to inconsistent tags and overlooked negative spikes."*

### Slide 3: The Solution
* **Key Points:** Multi-channel ingestion, Groq LLM classification, 15-day rolling trend spikes, grounded RAG Q&A, VoC report generation.
* **Speaker Notes:** *"LOOP classifies incoming feedback automatically, tracks negative spikes, and enables zero-hallucination Q&A."*

### Slide 4: System Architecture
* **Key Points:** Next.js 15, TypeScript, Tailwind CSS, PostgreSQL + Prisma, NextAuth RBAC, Groq Cloud SDK.
* **Speaker Notes:** *"Our architecture leverages Next.js 15 App Router, Prisma ORM, PostgreSQL, and Groq's Llama 3.3 70B model."*

### Slide 5: Multi-Tenant Security & RBAC
* **Key Points:** Tenant workspace isolation (`workspaceId`), Role permissions (`ADMIN`, `ANALYST`, `VIEWER`).
* **Speaker Notes:** *"Security is enforced at the database level, preventing cross-tenant data leaks and controlling role permissions."*

### Slide 6: Ingestion & Auto-Classification
* **Key Points:** Bulk CSV parsing, sentiment scores (-1.0 to +1.0), theme tagging, AI rationale, rule-based fallback.
* **Speaker Notes:** *"CSV uploads automatically extract sentiment, feature area tags, and concise AI rationales."*

### Slide 7: Server-Paginated Feedback Inbox
* **Key Points:** Unified feed, full-text search, multi-filtering by channel, sentiment, status, and theme.
* **Speaker Notes:** *"The Inbox allows product leads to filter for negative billing tickets in under a second."*

### Slide 8: Visual Analytics & Spike Detection
* **Key Points:** Recharts graphs, 15-day rolling window comparison, surge rate alerts (+150% spikes).
* **Speaker Notes:** *"Theme Trends flags sudden surges in negative feedback before churn occurs."*

### Slide 9: Grounded RAG & VoC Reports
* **Key Points:** Ask LOOP grounded assistant, Executive VoC report generator.
* **Speaker Notes:** *"Ask LOOP answers questions grounded strictly in database records without hallucinating."*

### Slide 10: Conclusion & Demo Access
* **Key Points:** App live at `http://localhost:3000`, credentials cheatsheet (`admin@loop.com` / `Password123`).
* **Speaker Notes:** *"Thank you! I welcome any questions from the audience."*

---

## 10. Video Demo Walkthrough & Testimonial Script

### 3–5 Minute Video Walkthrough Script:
1. **Scene 1 (0:00–0:45) - Login & RBAC:** Log in with `admin@loop.com`, demonstrate workspace isolation & Team Members page.
2. **Scene 2 (0:45–1:30) - Ingestion & Classification:** Upload `test_feedback.csv`, showcase auto-classification metadata (sentiment, score, rationale).
3. **Scene 3 (1:30–2:15) - Feedback Inbox:** Search `billing`, filter by `NEG` sentiment and `Support ticket` channel.
4. **Scene 4 (2:15–3:00) - Theme Trends:** Review 15-day volume charts, negative spike rates, and verbatim quotes.
5. **Scene 5 (3:00–3:45) - Ask LOOP RAG:** Ask *"What are customers complaining about regarding billing?"*, highlight grounded citations.
6. **Scene 6 (3:45–4:30) - VoC Digest:** Select date range, click **Generate VoC Report**, review executive recommendations.

### 1–2 Minute Internship Testimonial Script:
> *"Reflecting on my internship while building Project LOOP has been an incredibly rewarding journey. Working with Next.js 15 App Router, TypeScript, PostgreSQL with Prisma, and Groq LLMs taught me how to design production-grade, secure software. Building the dual-engine fallback classifier and optimizing server components for fast tab switching significantly strengthened my full-stack skills. Thank you for this amazing opportunity!"*

---

## 11. Demo Credentials & Sample CSV Data

### Demo Credentials Checklist

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@loop.com` | `Password123` | Full workspace control, team management, CSV ingest, reports. |
| **Analyst** | `analyst@loop.com` | `Password123` | Write access (ingest feedback, reclassify entries, compile reports). |
| **Viewer** | `viewer@loop.com` | `Password123` | Read-only access (dashboard charts, inbox items, Ask LOOP Q&A). |

### Sample CSV Dataset (`test_feedback.csv`)

```csv
content,channel,customer_label,created_at
"Onboarding took forever — I couldn't figure out how to invite my team. The invitation links are failing on Firefox browser.","Support ticket","Mark Zuckerberg","2026-07-15T10:00:00Z"
"The app is super snappy today! Noticeable improvement in database queries and dashboard loads.","Community post","Elon Musk","2026-07-16T14:30:00Z"
"It does the job, but the mobile experience needs work. Tables shrink and horizontal scroll is a nightmare on smaller screens.","NPS survey","Bill Gates","2026-07-17T09:15:00Z"
"Why does the billing invoice PDF keep failing to download? I've been trying to submit expenses for 3 days.","Support ticket","Jeff Bezos","2026-07-18T11:22:00Z"
"Okta integration was seamless! Our compliance team is happy with the SAML security validation.","Community post","Satya Nadella","2026-07-19T16:45:00Z"
"The pricing structure is not transparent. We got billed for 15 deactivated seats without notifications.","Sales call note","Sundar Pichai","2026-07-20T13:10:00Z"
"Android application crashes immediately when I open the analytics charts tab. Working on v2.1.0, crashed on v2.1.1.","App store review","Tim Cook","2026-07-21T08:05:00Z"
"We are considering upgrading to the Enterprise tier, but we require a signed SLA and custom yearly invoice processing.","Sales call note","Jensen Huang","2026-07-22T15:30:00Z"
"Absolutely loving the clean UI redesign! Navigation is much faster and simpler. Good job on the update.","App store review","Lisa Su","2026-07-23T17:50:00Z"
"SSO logins keep dropping every time I close my Chrome window. This is forcing daily authentications.","Support ticket","Sheryl Sandberg","2026-07-24T10:15:00Z"
"The tutorial guides are too long. Let us skip the walkthrough and go straight to the project dashboard.","NPS survey","Larry Page","2026-07-24T12:00:00Z"
"Billing page throws a 500 error when attempting to update credit card details. This is blocking our renewal.","Support ticket","Sergey Brin","2026-07-24T14:40:00Z"
"Great desktop experience, but the mobile layout has cut-off headers. Hard to tap navigation buttons on iPhone SE.","App store review","Steve Ballmer","2026-07-24T16:20:00Z"
"Is there a plan to support webhooks for notifications? We need real-time alerts in Slack when tickets fail.","Community post","Jack Dorsey","2026-07-24T18:10:00Z"
"Security logs do not show IP addresses. This is a critical auditing failure for our company compliance.","Support ticket","Reed Hastings","2026-07-24T20:30:00Z"
"Excellent documentation. It took our engineering team less than an hour to set up the workspace.","Community post","Gwynne Shotwell","2026-07-24T22:15:00Z"
"NPS question is popping up too frequently. Please change the trigger interval to 90 days.","NPS survey","Susan Wojcicki","2026-07-25T00:05:00Z"
"Support agent was very helpful but the app itself is too slow when loading historical search tables.","Support ticket","Andy Jassy","2026-07-25T01:30:00Z"
"I received a duplicate charge this month. Please refund the secondary transaction.","Support ticket","Marc Benioff","2026-07-25T02:45:00Z"
"The team page has a pagination bug where clicking page 2 just refreshes the current active page.","Support ticket","Parag Agrawal","2026-07-25T03:10:00Z"
```

---
