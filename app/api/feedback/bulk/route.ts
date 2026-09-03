import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, "write:feedback")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions to delete feedback" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = bulkDeleteSchema.parse(body);

    const workspaceId = session.user.workspaceId;
    const actorName = session.user.name || session.user.email || "User";

    if (validatedData.all) {
      const result = await prisma.feedback.deleteMany({
        where: { workspaceId },
      });

      await logActivity(
        "Purged All Feedback Inbox",
        actorName,
        `Deleted all ${result.count} feedback records from workspace inbox`,
        workspaceId
      );

      return NextResponse.json({
        message: `Successfully deleted all ${result.count} feedback records`,
        count: result.count,
      });
    }

    if (validatedData.ids && validatedData.ids.length > 0) {
      const result = await prisma.feedback.deleteMany({
        where: {
          id: { in: validatedData.ids },
          workspaceId,
        },
      });

      await logActivity(
        "Bulk Delete Feedback",
        actorName,
        `Deleted ${result.count} selected feedback records`,
        workspaceId
      );

      return NextResponse.json({
        message: `Successfully deleted ${result.count} feedback records`,
        count: result.count,
      });
    }

    return NextResponse.json(
      { error: "Please provide either feedback IDs or set all to true" },
      { status: 400 }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error bulk deleting feedback:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
