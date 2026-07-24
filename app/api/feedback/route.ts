import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Sentiment, FeedbackStatus, Priority, Prisma } from "@prisma/client";
import { getEmbedding } from "@/lib/embeddings";

// Zod schemas for validation
const createFeedbackSchema = z.object({
  content: z.string().min(1, "Content is required"),
  channel: z.string().min(1, "Channel is required"),
  customerLabel: z.string().optional(),
  sentiment: z.nativeEnum(Sentiment).default(Sentiment.NEU),
  sentimentScore: z.number().min(-1).max(1).default(0.0),
  status: z.nativeEnum(FeedbackStatus).default(FeedbackStatus.NEW),
  priority: z.nativeEnum(Priority).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    
    // Pagination params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Filter params
    const channel = searchParams.get("channel");
    const sentiment = searchParams.get("sentiment");
    const status = searchParams.get("status");
    const themeId = searchParams.get("themeId");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const dateStart = searchParams.get("dateStart");
    const dateEnd = searchParams.get("dateEnd");

    // Build query where clause
    const where: Prisma.FeedbackWhereInput = {
      workspaceId: session.user.workspaceId,
    };

    if (channel) {
      where.channel = channel;
    }

    if (sentiment) {
      where.sentiment = sentiment as Sentiment;
    }

    if (status) {
      where.status = status as FeedbackStatus;
    }

    if (priority) {
      where.priority = priority as Priority;
    }

    if (themeId) {
      where.feedbackThemes = {
        some: {
          themeId: themeId,
        },
      };
    }

    if (search) {
      where.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (dateStart || dateEnd) {
      where.createdAt = {};
      if (dateStart) {
        where.createdAt.gte = new Date(dateStart);
      }
      if (dateEnd) {
        where.createdAt.lte = new Date(dateEnd);
      }
    }

    // Execute queries
    const [total, items] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          feedbackThemes: {
            include: {
              theme: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching feedback:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC permission check
    if (!hasPermission(session.user.role, "write:feedback")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createFeedbackSchema.parse(body);

    // Auto-calculate priority based on sentiment if not provided
    let finalPriority = validatedData.priority;
    if (!finalPriority) {
      if (validatedData.sentiment === Sentiment.NEG) {
        finalPriority = Priority.HIGH;
      } else if (validatedData.sentiment === Sentiment.NEU) {
        finalPriority = Priority.MEDIUM;
      } else {
        finalPriority = Priority.LOW;
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        content: validatedData.content,
        channel: validatedData.channel,
        customerLabel: validatedData.customerLabel,
        sentiment: validatedData.sentiment,
        sentimentScore: validatedData.sentimentScore,
        status: validatedData.status,
        priority: finalPriority,
        workspaceId: session.user.workspaceId,
      },
    });

    // Create embedding
    const vector = await getEmbedding(feedback.content);
    const vectorString = `[${vector.join(",")}]`;
    await prisma.$executeRaw`
      INSERT INTO "Embedding" ("id", "feedbackId", "vector")
      VALUES (${`emb_${feedback.id}`}, ${feedback.id}, ${vectorString}::vector)
    `;

    return NextResponse.json(feedback, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating feedback:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
