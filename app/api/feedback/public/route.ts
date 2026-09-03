import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Sentiment, FeedbackStatus, Priority } from "@prisma/client";
import { getEmbedding } from "@/lib/embeddings";
import { classifyFeedbackText } from "@/lib/ai";
import { logActivity } from "@/lib/activity";

const publicFeedbackSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  content: z.string().min(1, "Content is required"),
  email: z.string().email("A valid email address is required"),
  name: z.string().min(1, "Name is required"),
  rating: z.number().min(1).max(5).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = publicFeedbackSchema.parse(body);

    // 1. Verify workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: validatedData.workspaceId },
      select: { id: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Invalid workspace ID" }, { status: 400 });
    }

    // 2. Fetch existing themes to run AI classification
    const workspaceThemes = await prisma.theme.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true },
    });
    const themeNames = workspaceThemes.map((t) => t.name);

    // 3. AI classification (sentiment, score, themes)
    let sentiment: Sentiment = Sentiment.NEU;
    let sentimentScore = 0.0;
    let classificationThemes: string[] = [];

    // Pre-calculate fallback sentiment based on rating if present
    if (validatedData.rating) {
      if (validatedData.rating >= 4) {
        sentiment = Sentiment.POS;
        sentimentScore = (validatedData.rating - 3) / 2; // 0.5 to 1.0
      } else if (validatedData.rating <= 2) {
        sentiment = Sentiment.NEG;
        sentimentScore = -((3 - validatedData.rating) / 2); // -0.5 to -1.0
      }
    }

    try {
      const contentToClassify = validatedData.rating 
        ? `Rating: ${validatedData.rating}/5 stars. Comment: ${validatedData.content}`
        : validatedData.content;
      const classification = await classifyFeedbackText(contentToClassify, themeNames);
      sentiment = classification.sentiment;
      sentimentScore = classification.sentimentScore;
      classificationThemes = classification.themes;
    } catch (aiErr) {
      console.error("AI feedback classification failed, using defaults:", aiErr);
    }

    // Auto-calculate priority based on sentiment
    let priority: Priority = Priority.MEDIUM;
    if (sentiment === Sentiment.NEG) {
      priority = Priority.HIGH;
    } else if (sentiment === Sentiment.POS) {
      priority = Priority.LOW;
    }

    // 4. Create feedback record
    const customerLabel = `${validatedData.name} <${validatedData.email}>`;
    const finalContent = validatedData.rating 
      ? `[CSAT Rating: ${validatedData.rating}/5 ⭐] ${validatedData.content}`
      : validatedData.content;

    const feedback = await prisma.feedback.create({
      data: {
        content: finalContent,
        channel: "Public Form",
        customerLabel,
        sentiment,
        sentimentScore,
        status: FeedbackStatus.NEW,
        priority,
        workspaceId: workspace.id,
      },
    });

    await logActivity(
      "Public Feedback Submission",
      customerLabel,
      `Submitted feedback: "${validatedData.content.substring(0, 80)}${validatedData.content.length > 80 ? "..." : ""}"`,
      workspace.id
    );

    // 5. Connect classification themes
    for (const themeName of classificationThemes) {
      // Find theme in workspace or create it if AI returned a new one
      let theme = workspaceThemes.find(
        (t) => t.name.toLowerCase() === themeName.toLowerCase()
      );

      if (!theme) {
        try {
          theme = await prisma.theme.create({
            data: {
              name: themeName,
              workspaceId: workspace.id,
            },
            select: { id: true, name: true },
          });
        } catch (themeErr) {
          console.error("Failed to create classification theme:", themeErr);
        }
      }

      if (theme) {
        try {
          await prisma.feedbackTheme.create({
            data: {
              feedbackId: feedback.id,
              themeId: theme.id,
              confidence: 0.9,
            },
          });
        } catch (linkErr) {
          console.error("Failed to link theme to feedback:", linkErr);
        }
      }
    }

    // 6. Generate embedding and insert vector
    try {
      const vector = await getEmbedding(feedback.content);
      const vectorString = `[${vector.join(",")}]`;
      await prisma.$executeRaw`
        INSERT INTO "Embedding" ("id", "feedbackId", "vector")
        VALUES (${`emb_${feedback.id}`}, ${feedback.id}, ${vectorString}::vector)
      `;
    } catch (embedErr) {
      console.error("Embedding generation failed for public feedback:", embedErr);
    }

    return NextResponse.json(feedback, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating public feedback:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
