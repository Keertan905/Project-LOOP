import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Sentiment, FeedbackStatus, Priority } from "@prisma/client";
import { getEmbedding } from "@/lib/embeddings";

const SIMULATED_FEEDBACK = [
  {
    content: "SSO login keeps dropping on Chrome. Every time I close the tab I have to re-authenticate via Okta. This is highly disruptive.",
    channel: "Support ticket",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.75,
    themeName: "SSO & Security",
    customerLabel: "David Miller",
  },
  {
    content: "The new bulk CSV upload is brilliant! Worked flawlessly on our first try importing 2000 rows. Thank you for this update.",
    channel: "Community post",
    sentiment: Sentiment.POS,
    sentimentScore: 0.95,
    themeName: "Onboarding Experience",
    customerLabel: "Sarah Jenkins",
  },
  {
    content: "Can you provide a clear description of the data protection policies? Our security board needs to sign off on database backups.",
    channel: "Support ticket",
    sentiment: Sentiment.NEU,
    sentimentScore: 0.1,
    themeName: "SSO & Security",
    customerLabel: "Marcus Vance",
  },
  {
    content: "Great charts dashboard, but I can't export the charts as PDF or image. We need to present these to executive board members.",
    channel: "NPS survey",
    sentiment: Sentiment.NEU,
    sentimentScore: -0.2,
    themeName: "Performance & Reliability",
    customerLabel: "Emily Chen",
  },
  {
    content: "Why are billing notifications sent to all workspace members instead of just the billing owner? Please fix the routing settings.",
    channel: "Support ticket",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.5,
    themeName: "Billing & Pricing",
    customerLabel: "Rachel Green",
  },
  {
    content: "Absolutely loving the clean UI design on mobile! Fast response times and easy-to-use search. Highly recommend.",
    channel: "App store review",
    sentiment: Sentiment.POS,
    sentimentScore: 0.9,
    themeName: "Mobile Experience",
    customerLabel: "Alex Rivera",
  },
  {
    content: "The load time of our custom reports page spiked today to 15 seconds. Please investigate the backend server health.",
    channel: "Support ticket",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.85,
    themeName: "Performance & Reliability",
    customerLabel: "Thomas Wright",
  },
  {
    content: "Is there a plan to support monthly invoices? Standard credit card billing isn't working for our accounting team.",
    channel: "Sales call note",
    sentiment: Sentiment.NEU,
    sentimentScore: 0.0,
    themeName: "Billing & Pricing",
    customerLabel: "Oliver Stone",
  },
  {
    content: "Our team just completed onboarding and setup. The interactive tutorial guides made it very easy to get everyone aligned.",
    channel: "Community post",
    sentiment: Sentiment.POS,
    sentimentScore: 0.8,
    themeName: "Onboarding Experience",
    customerLabel: "Sophia Loren",
  },
  {
    content: "Mobile layout is cut off on small screens (iPhone SE). The navigation buttons are overlapping the header.",
    channel: "App store review",
    sentiment: Sentiment.NEG,
    sentimentScore: -0.6,
    themeName: "Mobile Experience",
    customerLabel: "Leo Fitz",
  },
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, "write:feedback")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const workspaceId = session.user.workspaceId;

    // Fetch existing themes in this workspace to link correctly
    const workspaceThemes = await prisma.theme.findMany({
      where: { workspaceId },
    });

    let createdCount = 0;

    for (const item of SIMULATED_FEEDBACK) {
      // Find matching theme or default to the first one in the workspace
      const matchedTheme = workspaceThemes.find(
        (t) => t.name.toLowerCase() === item.themeName.toLowerCase()
      );

      let finalPriority: Priority = Priority.MEDIUM;
      if (item.sentiment === Sentiment.NEG) {
        finalPriority = Priority.HIGH;
      } else if (item.sentiment === Sentiment.POS) {
        finalPriority = Priority.LOW;
      }

      const feedback = await prisma.feedback.create({
        data: {
          content: item.content,
          channel: item.channel,
          sourceRef: `simulated-${Date.now()}-${createdCount}`,
          customerLabel: item.customerLabel,
          sentiment: item.sentiment,
          sentimentScore: item.sentimentScore,
          status: FeedbackStatus.NEW,
          priority: finalPriority,
          workspaceId,
        },
      });

      if (matchedTheme) {
        await prisma.feedbackTheme.create({
          data: {
            feedbackId: feedback.id,
            themeId: matchedTheme.id,
            confidence: 0.95,
          },
        });
      }

      // Add embedding vector
      const vector = await getEmbedding(feedback.content);
      const vectorString = `[${vector.join(",")}]`;
      await prisma.$executeRaw`
        INSERT INTO "Embedding" ("id", "feedbackId", "vector")
        VALUES (${`emb_${feedback.id}`}, ${feedback.id}, ${vectorString}::vector)
      `;

      createdCount++;
    }

    return NextResponse.json({
      message: `Successfully ingested ${createdCount} simulated feedback items.`,
      count: createdCount,
    });
  } catch (error: unknown) {
    console.error("Error ingesting simulated feedback:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
