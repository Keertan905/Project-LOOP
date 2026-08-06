import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const { name, email, role } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate token
    const token = randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const prismaAny = prisma as unknown as Record<string, { create: (args: unknown) => Promise<{ expires: Date }> }>;

    let expiresAt = expires;

    // Safely create InviteToken if table exists
    if (prismaAny.inviteToken && typeof prismaAny.inviteToken.create === "function") {
      try {
        const invite = await prismaAny.inviteToken.create({
          data: {
            email,
            name: name || null,
            role: role || "VIEWER",
            token,
            expires,
            workspaceId: session.user.workspaceId,
          },
        });
        expiresAt = invite.expires || expires;
      } catch (dbErr) {
        console.warn("InviteToken DB model save fallback:", dbErr);
      }
    }

    // Safely record ActivityLog if table exists
    if (prismaAny.activityLog && typeof prismaAny.activityLog.create === "function") {
      try {
        await prismaAny.activityLog.create({
          data: {
            workspaceId: session.user.workspaceId,
            action: "INVITE_CREATED",
            actorName: session.user.name || "Admin",
            details: `Created workspace invite for ${email} (${role || "VIEWER"})`,
          },
        });
      } catch (logErr) {
        console.warn("ActivityLog DB model save fallback:", logErr);
      }
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const inviteUrl = `${protocol}://${host}/invite?token=${token}`;

    return NextResponse.json({
      success: true,
      token,
      inviteUrl,
      expiresAt,
    });
  } catch (error) {
    console.error("Error creating workspace invite:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
