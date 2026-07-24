import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Sentiment, FeedbackStatus } from "@prisma/client";
import { getEmbedding } from "@/lib/embeddings";

// Individual row validation schema
const feedbackRowSchema = z.object({
  content: z.string().min(1, "Content is required"),
  channel: z.string().min(1, "Channel is required"),
  customerLabel: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
});

const bulkImportSchema = z.object({
  items: z.array(feedbackRowSchema),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, "write:feedback")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = bulkImportSchema.parse(body);

    const workspaceId = session.user.workspaceId;
    let importedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process each feedback item sequentially
    for (let index = 0; index < validatedData.items.length; index++) {
      const item = validatedData.items[index];
      try {
        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();

        // Single DB insert
        const feedback = await prisma.feedback.create({
          data: {
            content: item.content,
            channel: item.channel,
            customerLabel: item.customerLabel || null,
            sentiment: Sentiment.NEU, // Default until AI classification processes it
            sentimentScore: 0.0,
            status: FeedbackStatus.NEW,
            createdAt: isNaN(createdDate.getTime()) ? new Date() : createdDate,
            workspaceId,
          },
        });

        // Create embedding
        const vector = await getEmbedding(feedback.content);
        const vectorString = `[${vector.join(",")}]`;
        await prisma.$executeRaw`
          INSERT INTO "Embedding" ("id", "feedbackId", "vector")
          VALUES (${`emb_${feedback.id}`}, ${feedback.id}, ${vectorString}::vector)
        `;

        importedCount++;
      } catch (err: unknown) {
        failedCount++;
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`Row ${index + 1}: ${errMsg}`);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      failedCount,
      errors,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error bulk importing feedback:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
