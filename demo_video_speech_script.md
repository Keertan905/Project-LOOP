# 🎙️ PROJECT LOOP — Demo Video Speech Script (Word-for-Word Teleprompter)

This document contains your exact, word-for-word spoken script for recording both your **3–5 Minute Product Demo Video** and your **1–2 Minute Self-Feedback Internship Video**.

---

## 🎬 PART 1: 3 to 4-Minute Product Walkthrough Video Script

```text
⏱️ Total Target Video Duration: 3:30 to 4:15 Minutes
💡 Tip: Speak clearly, at a moderate pace, and pause slightly when transitioning between pages.
```

---

### ⏱️ SECTION 1: Introduction & Admin Login (0:00 – 0:45)

* 🖥️ **WHAT TO DO ON SCREEN:**
  1. Start recording on the Login page at `http://localhost:3000/login`.
  2. Type `admin@loop.com` and `Password123`, then click **Sign In**.
  3. You arrive on the Overview Dashboard.
  4. Click **Team Members** on the sidebar (`/dashboard/members`).

* 🗣️ **EXACT WORDS TO SPEAK:**

> "Hello everyone! Welcome to my demonstration of **Project LOOP**—an AI-powered, multi-tenant customer feedback intelligence platform.
>
> In tech companies today, customer feedback is scattered everywhere—from support tickets to app store reviews. LOOP solves this by using AI to ingest, auto-classify, and synthesize feedback into actionable product strategy.
>
> I’m starting by logging in as an Admin using `admin@loop.com`. LOOP enforces multi-tenant data isolation and Role-Based Access Control. As an Admin, I have full workspace control, including managing team members across Admin, Analyst, and Viewer roles."

---

### ⏱️ SECTION 2: Ingesting CSV & AI Auto-Classification (0:45 – 1:30)

* 🖥️ **WHAT TO DO ON SCREEN:**
  1. Click **Ingest Feedback** on the sidebar (`/dashboard/ingest`).
  2. Click the **CSV Bulk Upload** tab.
  3. Drag and drop `test_feedback.csv`.
  4. Click **Upload & Process CSV** and watch the success banner pop up.

* 🗣️ **EXACT WORDS TO SPEAK:**

> "Now, let’s look at feedback ingestion. LOOP lets teams ingest single entries, simulate webhooks, or bulk upload CSV files. 
> 
> I’m uploading a CSV containing 21 real-world feedback items from tech leaders. As soon as I hit upload, LOOP’s AI pipeline processes every row using Groq’s Llama 3.3 70B model.
> 
> It automatically assigns sentiment scores from -1.0 to +1.0, tags feature areas like Billing or Security, categorizes themes, and writes a one-line AI rationale explaining the classification."

---

### ⏱️ SECTION 3: Feedback Inbox & Multi-Filtering (1:30 – 2:15)

* 🖥️ **WHAT TO DO ON SCREEN:**
  1. Click **Feedback Inbox** on the sidebar (`/dashboard/inbox`).
  2. In the search bar, type `billing`.
  3. Filter by Sentiment: Select **Negative (`NEG`)**.
  4. Filter by Channel: Select **Support Ticket**.
  5. Click a feedback row to expand its details panel.

* 🗣️ **EXACT WORDS TO SPEAK:**

> "Next, let’s switch to the Feedback Inbox. This gives support and product teams a unified, server-paginated control center for all incoming feedback.
>
> We can perform instant search and multi-attribute filtering. For example, filtering for negative support tickets regarding *'billing'* instantly surfaces critical customer complaints—complete with their auto-classified sentiment score and AI rationale."

---

### ⏱️ SECTION 4: Theme Trends & Spike Rate Detection (2:15 – 3:00)

* 🖥️ **WHAT TO DO ON SCREEN:**
  1. Click **Theme Trends** on the sidebar (`/dashboard/trends`).
  2. Point out the top metric cards (Volume & Spike Rates).
  3. Scroll down to show the Recharts volume and sentiment distribution graphs.
  4. Click on the **Billing & Pricing** theme card to expand verbatim quotes.

* 🗣️ **EXACT WORDS TO SPEAK:**

> "Moving to Theme Trends, LOOP turns qualitative text into quantitative graphs powered by Recharts.
>
> The platform compares rolling 15-day time windows to compute spike rates—automatically flagging themes with sudden surges in negative feedback. Clicking on any theme card expands real customer verbatim quotes, allowing product managers to validate bugs before engineering fixes."

---

### ⏱️ SECTION 5: Grounded RAG Assistant — Ask LOOP (3:00 – 3:45)

* 🖥️ **WHAT TO DO ON SCREEN:**
  1. Click **Ask LOOP AI** on the sidebar (`/dashboard/ask`).
  2. Type: `"What are customers complaining about regarding billing?"`
  3. Click Send and watch the grounded AI response generate.

* 🗣️ **EXACT WORDS TO SPEAK:**

> "Next is Ask LOOP—our grounded Retrieval-Augmented Generation assistant. Product managers can ask natural language questions about customer feedback.
>
> Unlike generic chatbots that hallucinate facts, Ask LOOP is strictly grounded in our tenant’s database records. It cites actual customer feedback verbatim without inventing features, enabling instant Q&A across thousands of comments."

---

### ⏱️ SECTION 6: VoC Executive Reports & Conclusion (3:45 – 4:30)

* 🖥️ **WHAT TO DO ON SCREEN:**
  1. Click **AI Reports** on the sidebar (`/dashboard/reports`).
  2. Select Date Range (e.g., Last 30 Days).
  3. Click **Generate VoC Digest**.
  4. Scroll down through Executive Summary, Customer Quotes, and Engineering Action Plan.

* 🗣️ **EXACT WORDS TO SPEAK:**

> "Finally, let’s generate a Voice-of-Customer Executive Report. In the AI Reports section, admins can select a date window and generate a complete digest.
>
> The AI synthesizes overall customer sentiment, emerging theme shifts, representative verbatim quotes, and prioritized action items for product teams. Reports are saved directly to PostgreSQL for team export.
>
> That concludes my walkthrough of Project LOOP. Thank you for watching!"

---

## 🎙️ PART 2: 1 to 2-Minute Self-Feedback Internship Testimonial Script

```text
⏱️ Total Target Video Duration: 1:15 to 1:45 Minutes
💡 Tip: Look directly into your camera, smile, and speak naturally.
```

* 🗣️ **EXACT WORDS TO SPEAK:**

> "Hello everyone! Reflecting on my internship experience while building **Project LOOP** has been an incredibly rewarding journey.
>
> During this internship, I got the opportunity to work with modern full-stack technologies including Next.js 15 App Router, TypeScript, Tailwind CSS, PostgreSQL with Prisma ORM, and NextAuth.js. 
>
> One of the most exciting technical challenges was designing the AI classification pipeline—integrating Groq’s Llama 3.3 70B model with a deterministic fallback classifier to guarantee 100% uptime even if network keys aren't present.
>
> I also gained hands-on experience implementing multi-tenant security isolation, grounded RAG search, and optimizing server component rendering with loading skeletons for fast tab switching.
>
> Overcoming these challenges taught me how to write production-grade, maintainable code. I want to sincerely thank my mentors for their guidance and support throughout this internship. Thank you!"

---
