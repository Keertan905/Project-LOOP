import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { generateVoCReport } from "@/lib/ai";
import { Sentiment } from "@prisma/client";

const createReportSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  periodStart: z.string().datetime("Invalid start date"),
  periodEnd: z.string().datetime("Invalid end date"),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: {
        workspaceId: session.user.workspaceId,
      },
      select: {
        id: true,
        title: true,
        periodStart: true,
        periodEnd: true,
        createdAt: true,
        generatedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error: unknown) {
    console.error("Error fetching reports:", error);
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

    // Only Admin & Analyst can generate reports
    if (!hasPermission(session.user.role, "write:reports")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createReportSchema.parse(body);

    const workspaceId = session.user.workspaceId;
    const start = new Date(validatedData.periodStart);
    const end = new Date(validatedData.periodEnd);

    // 1. Fetch matching feedbacks inside the time range
    const feedbacks = await prisma.feedback.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        content: true,
        sentiment: true,
      },
    });

    if (feedbacks.length === 0) {
      return NextResponse.json(
        { error: "No feedback records found in the selected date range to compile a report." },
        { status: 400 }
      );
    }

    // 2. Compute metrics
    const totalCount = feedbacks.length;
    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    const quotes: string[] = [];

    feedbacks.forEach((f) => {
      if (f.sentiment === Sentiment.POS) posCount++;
      else if (f.sentiment === Sentiment.NEG) negCount++;
      else neuCount++;

      // Take a few representative quotes
      if (quotes.length < 5 && (f.sentiment === Sentiment.POS || f.sentiment === Sentiment.NEG)) {
        quotes.push(f.content);
      }
    });

    // If we didn't get enough quotes, fill from remaining
    if (quotes.length < 5) {
      feedbacks.forEach((f) => {
        if (quotes.length < 5 && !quotes.includes(f.content)) {
          quotes.push(f.content);
        }
      });
    }

    // 3. Count themes
    const themeCountsRaw = await prisma.theme.findMany({
      where: { workspaceId },
      select: {
        name: true,
        feedbackThemes: {
          where: {
            feedback: {
              workspaceId,
              createdAt: {
                gte: start,
                lte: end,
              },
            },
          },
          select: {
            feedbackId: true,
          },
        },
      },
    });

    const themeStats = themeCountsRaw
      .map((t) => ({
        name: t.name,
        count: t.feedbackThemes.length,
      }))
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count);

    // 4. Generate AI Narrative text
    const narrativeText = await generateVoCReport(
      validatedData.title,
      {
        totalCount,
        posCount,
        neuCount,
        negCount,
        themeStats,
      },
      quotes
    );

    // 5. Save report in DB
    const report = await prisma.report.create({
      data: {
        title: validatedData.title,
        periodStart: start,
        periodEnd: end,
        contentJson: narrativeText, // Store raw generated text directly
        workspaceId,
        generatedById: session.user.id,
      },
      include: {
        generatedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating report:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
