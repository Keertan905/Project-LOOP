import { prisma } from "./prisma";

export async function logActivity(
  action: string,
  actorName: string,
  details: string | null,
  workspaceId: string
) {
  try {
    return await prisma.activityLog.create({
      data: {
        action,
        actorName,
        details,
        workspaceId,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
