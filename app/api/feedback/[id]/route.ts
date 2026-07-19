import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { FeedbackStatus } from "@prisma/client";

const updateFeedbackSchema = z.object({
  status: z.nativeEnum(FeedbackStatus).optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC write permission check
    if (!hasPermission(session.user.role, "write:feedback")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const validatedData = updateFeedbackSchema.parse(body);

    // Verify feedback exists and belongs to the user's workspace
    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback || feedback.workspaceId !== session.user.workspaceId) {
      return NextResponse.json(
        { error: "Feedback record not found in this workspace" },
        { status: 404 }
      );
    }

    // Perform update
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedFeedback);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error updating feedback:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, "write:feedback")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const { id } = await params;

    // Verify feedback exists and belongs to user's workspace
    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback || feedback.workspaceId !== session.user.workspaceId) {
      return NextResponse.json(
        { error: "Feedback record not found in this workspace" },
        { status: 404 }
      );
    }

    // Perform delete
    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Feedback deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting feedback:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}

