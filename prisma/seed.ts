import { PrismaClient, Role, Sentiment, FeedbackStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { getDeterministicMockVector } from "../lib/embeddings";

const prisma = new PrismaClient();

const THEMES_DATA = [
  { name: "Onboarding Experience", description: "Feedback related to signup, initial setup, tutorials, and getting started.", color: "indigo" },
  { name: "Billing & Pricing", description: "Pricing, subscription plans, invoices, and billing issues.", color: "red" },
  { name: "Mobile Experience", description: "App store reviews, mobile responsiveness, and mobile device features.", color: "purple" },
  { name: "Performance & Reliability", description: "Slow loading times, crashes, downtime, and technical bugs.", color: "orange" },
  { name: "SSO & Security", description: "Single sign-on, authentication issues, and security compliance.", color: "emerald" },
];

const FEEDBACK_TEMPLATES = [
  // Onboarding Experience
  {
    content: "The signup process was extremely simple, but the initial dashboard walkthrough felt a bit rushed. I'd love more step-by-step guides.",
    channel: "NPS survey",
    sentiment: Sentiment.POS,
    sentimentScore: 0.6,
    themeIndex: 0,
    status: FeedbackStatus.NEW,
  },
  {
    content: "Onboarding took forever — I couldn't figure out how to invite my team members to the workspace. The UI is confusing.",
    channel: "Support ticket",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.7,
    themeIndex: 0,
    status: FeedbackStatus.REVIEWED,
  },
  {
    content: "I love the quick-start templates! They got me set up in less than 5 minutes. Brilliant job on the setup flow.",
    channel: "App store review",
    sentiment: Sentiment.POS,
    sentimentScore: 0.9,
    themeIndex: 0,
    status: FeedbackStatus.ACTIONED,
  },
  {
    content: "New user checklist doesn't mark items as completed even after I finish them. Confusing onboarding experience.",
    channel: "Support ticket",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.5,
    themeIndex: 0,
    status: FeedbackStatus.NEW,
  },
  {
    content: "SSO worked fine during login setup, but the next screen was just a blank dashboard. Took a refresh to see the tutorial.",
    channel: "Support ticket",
    sentiment: Sentiment.NEU,
    sentimentScore: 0.0,
    themeIndex: 0,
    status: FeedbackStatus.NEW,
  },

  // Billing & Pricing
  {
    content: "Pricing page is not transparent. We got charged for inactive users this month without any warning.",
    channel: "Support ticket",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.6,
    themeIndex: 1,
    status: FeedbackStatus.NEW,
  },
  {
    content: "Billing page keeps timing out when I try to download an invoice. Extremely frustrating when trying to submit expenses.",
    channel: "Support ticket",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.8,
    themeIndex: 1,
    status: FeedbackStatus.REVIEWED,
  },
  {
    content: "We are considering upgrading to the Enterprise tier, but we need custom invoicing. Can you support yearly billing contracts?",
    channel: "Sales call note",
    sentiment: Sentiment.NEU,
    sentimentScore: 0.2,
    themeIndex: 1,
    status: FeedbackStatus.NEW,
  },
  {
    content: "The product is great, but it's getting too expensive for a team of our size. Wish there was a middle-tier plan.",
    channel: "NPS survey",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.4,
    themeIndex: 1,
    status: FeedbackStatus.NEW,
  },

  // Mobile Experience
  {
    content: "It does the job, but the mobile experience needs work. Tables shrink and horizontal scroll is a nightmare.",
    channel: "NPS survey",
    sentiment: Sentiment.NEU,
    sentimentScore: -0.1,
    themeIndex: 2,
    status: FeedbackStatus.REVIEWED,
  },
  {
    content: "The new mobile dashboard is gorgeous and finally fast. Huge improvement over the web view! Love it.",
    channel: "App store review",
    sentiment: Sentiment.POS,
    sentimentScore: 0.9,
    themeIndex: 2,
    status: FeedbackStatus.ACTIONED,
  },
  {
    content: "Cannot upload CSV attachments from my iPhone. The select button is completely unresponsive in Safari.",
    channel: "Support ticket",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.6,
    themeIndex: 2,
    status: FeedbackStatus.NEW,
  },
  {
    content: "Android app crashes whenever I open the analytics charts tab. Please fix this bug, it was working last week.",
    channel: "App store review",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.8,
    themeIndex: 2,
    status: FeedbackStatus.NEW,
  },

  // Performance & Reliability
  {
    content: "The analytics page is taking over 10 seconds to load our workspace stats. It is almost unusable during peak hours.",
    channel: "Support ticket",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.7,
    themeIndex: 3,
    status: FeedbackStatus.NEW,
  },
  {
    content: "Had a 15-minute outage today right in the middle of our client presentation. We need 99.9% uptime guarantees.",
    channel: "Community post",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.9,
    themeIndex: 3,
    status: FeedbackStatus.NEW,
  },
  {
    content: "The app is super snappy today! Noticeable improvement in data loading speeds since the database migration.",
    channel: "Community post",
    sentiment: Sentiment.POS,
    sentimentScore: 0.8,
    themeIndex: 3,
    status: FeedbackStatus.ACTIONED,
  },

  // SSO & Security
  {
    content: "Prospect wants SSO before they'll sign — third time this month we've heard this from a mid-market customer.",
    channel: "Sales call note",
    sentiment: Sentiment.NEU,
    sentimentScore: 0.1,
    themeIndex: 4,
    status: FeedbackStatus.NEW,
  },
  {
    content: "Do you support SAML 2.0 or Okta integration? Our security team requires it for all third-party vendors.",
    channel: "Support ticket",
    sentiment: Sentiment.NEU,
    sentimentScore: 0.3,
    themeIndex: 4,
    status: FeedbackStatus.NEW,
  },
  {
    content: "Love the new session timeout policy and 2FA support. Makes our compliance review much easier.",
    channel: "Community post",
    sentiment: Sentiment.POS,
    sentimentScore: 0.7,
    themeIndex: 4,
    status: FeedbackStatus.ACTIONED,
  },
];

// Context modifiers to generate 120+ unique records
const CUSTOMERS = ["ClientA", "Enterprise Co", "StartupX", "Alpha Team", "User_482", "Growth Corp", "Beta Tester", "Partner Inc"];
const TIME_OFFSETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30]; // in days

async function main() {
  console.log("🌱 Starting seeding...");

  // 1. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Corp",
    },
  });
  console.log(`🏢 Created Workspace: ${workspace.name} (${workspace.id})`);

  // 2. Create Users
  const passwordHash = await bcrypt.hash("Password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Alice Admin",
      email: "admin@loop.com",
      password: passwordHash,
      role: Role.ADMIN,
      workspaceId: workspace.id,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Bob Analyst",
      email: "analyst@loop.com",
      password: passwordHash,
      role: Role.ANALYST,
      workspaceId: workspace.id,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Charlie Viewer",
      email: "viewer@loop.com",
      password: passwordHash,
      role: Role.VIEWER,
      workspaceId: workspace.id,
    },
  });

  console.log("👥 Created users:");
  console.log(`   - ADMIN: ${admin.email}`);
  console.log(`   - ANALYST: ${analyst.email}`);
  console.log(`   - VIEWER: ${viewer.email}`);

  // 3. Create Themes
  const themes = [];
  for (const t of THEMES_DATA) {
    const theme = await prisma.theme.create({
      data: {
        name: t.name,
        description: t.description,
        color: t.color,
        workspaceId: workspace.id,
      },
    });
    themes.push(theme);
  }
  console.log(`🏷️ Created ${themes.length} themes.`);

  // 4. Generate 125 Feedback items
  console.log("📥 Generating 125 feedback records...");
  let count = 0;
  const now = new Date();

  for (let i = 0; i < 125; i++) {
    const template = FEEDBACK_TEMPLATES[i % FEEDBACK_TEMPLATES.length];
    const customer = CUSTOMERS[i % CUSTOMERS.length];
    const daysAgo = TIME_OFFSETS[i % TIME_OFFSETS.length];
    const createdDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - (i % 24) * 60 * 60 * 1000);

    // Introduce slight content variations to keep it realistic
    let content = template.content;
    if (i % 3 === 0) {
      content = `[Ref: ${customer}] ${content}`;
    } else if (i % 3 === 1) {
      content = `${content} (Reported by our key customer ${customer}).`;
    }

    // Vary sentiment score slightly
    let score = template.sentimentScore;
    if (template.sentiment === Sentiment.POS) {
      score = Math.min(1.0, +(score + (i % 5) * 0.03).toFixed(2));
    } else if (template.sentiment === Sentiment.NEG) {
      score = Math.max(-1.0, +(score - (i % 5) * 0.03).toFixed(2));
    } else {
      score = +((i % 3 - 1) * 0.1).toFixed(2);
    }

    // Determine status
    let status = template.status;
    if (i % 4 === 0) status = FeedbackStatus.NEW;
    if (i % 4 === 1) status = FeedbackStatus.REVIEWED;
    if (i % 4 === 2) status = FeedbackStatus.ACTIONED;

    const feedback = await prisma.feedback.create({
      data: {
        content,
        channel: template.channel,
        sourceRef: `seed-${i + 1}`,
        customerLabel: customer,
        sentiment: template.sentiment,
        sentimentScore: score,
        status,
        createdAt: createdDate,
        updatedAt: createdDate,
        workspaceId: workspace.id,
      },
    });

    // Link theme
    const themeIndex = template.themeIndex;
    const theme = themes[themeIndex];
    await prisma.feedbackTheme.create({
      data: {
        feedbackId: feedback.id,
        themeId: theme.id,
        confidence: +(0.7 + (i % 4) * 0.08).toFixed(2),
      },
    });

    const vector = getDeterministicMockVector(feedback.content);
    const vectorString = `[${vector.join(",")}]`;
    await prisma.$executeRaw`
      INSERT INTO "Embedding" ("id", "feedbackId", "vector")
      VALUES (${`emb_${feedback.id}`}, ${feedback.id}, ${vectorString}::vector)
    `;

    count++;
  }

  console.log(`✅ Seeded successfully! Inserted ${count} feedback items.`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
