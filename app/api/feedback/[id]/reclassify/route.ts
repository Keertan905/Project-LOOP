import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { classifyFeedbackText } from "@/lib/ai";
import { logActivity } from "@/lib/activity";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check write:feedback permission
    if (!hasPermission(session.user.role, "write:feedback")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const { id } = await params;
    const workspaceId = session.user.workspaceId;

    // Fetch the feedback item
    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback || feedback.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Feedback record not found in this workspace" },
        { status: 404 }
      );
    }

    // Get all themes in this workspace for the classifier context
    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
      },
    });
    const themeNames = themes.map((t) => t.name);

    // Run the classifier again
    const classification = await classifyFeedbackText(feedback.content, themeNames);

    // Delete existing feedback-theme mappings
    await prisma.feedbackTheme.deleteMany({
      where: { feedbackId: id },
    });

    // Update feedback record
    await prisma.feedback.update({
      where: { id },
      data: {
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
        customerLabel: feedback.customerLabel || classification.featureArea, // Use featureArea as fallback label
      },
    });

    // Map new themes
    for (const tName of classification.themes) {
      // Find theme by name or create a new one in the workspace
      let theme = themes.find((t) => t.name.toLowerCase() === tName.toLowerCase());
      
      if (!theme) {
        // Create new theme
        const colorList = ["indigo", "red", "purple", "orange", "emerald"];
        const randomColor = colorList[Math.floor(Math.random() * colorList.length)];
        
        const newTheme = await prisma.theme.create({
          data: {
            name: tName,
            color: randomColor,
            workspaceId,
          },
        });
        theme = { id: newTheme.id, name: newTheme.name };
      }

      await prisma.feedbackTheme.create({
        data: {
          feedbackId: id,
          themeId: theme.id,
          confidence: 0.9,
        },
      });
    }

    await logActivity(
      "AI Reclassification",
      session.user.name || session.user.email || "Unknown User",
      `Reclassified feedback sentiment to ${classification.sentiment} and associated themes: ${classification.themes.join(", ")}`,
      workspaceId
    );

    // Return the updated feedback with its themes
    const finalFeedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        feedbackThemes: {
          include: {
            theme: true,
          },
        },
      },
    });

    return NextResponse.json(finalFeedback);
  } catch (error: unknown) {
    console.error("Error reclassifying feedback:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
