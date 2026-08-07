import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token query parameter is required" }, { status: 400 });
    }

    const prismaAny = prisma as any;
    const invite = await prismaAny.inviteToken?.findUnique?.({
      where: { token },
      include: { workspace: true },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 404 });
    }

    if (new Date() > new Date(invite.expires)) {
      return NextResponse.json({ error: "Invitation token has expired" }, { status: 410 });
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      name: invite.name,
      role: invite.role,
      workspaceName: invite.workspace?.name || "Loop Workspace",
    });
  } catch (error) {
    console.error("Error verifying invite token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    // Generate token and 7-day expiration
    const token = randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const assignedRole = (role && Object.values(Role).includes(role as Role)) ? (role as Role) : Role.VIEWER;

    const prismaAny = prisma as any;
    const invite = await prismaAny.inviteToken?.create?.({
      data: {
        email,
        name: name || null,
        role: assignedRole,
        token,
        expires,
        workspaceId: session.user.workspaceId,
      },
    });

    // Record ActivityLog if present
    try {
      if (prismaAny.activityLog?.create) {
        await prismaAny.activityLog.create({
          data: {
            workspaceId: session.user.workspaceId,
            action: "INVITE_CREATED",
            actorName: session.user.name || "Admin",
            details: `Created workspace invite for ${email} (${assignedRole})`,
          },
        });
      }
    } catch (logErr) {
      console.warn("ActivityLog create fallback:", logErr);
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const inviteUrl = `${protocol}://${host}/invite?token=${token}`;

    return NextResponse.json({
      success: true,
      token: invite?.token || token,
      inviteUrl,
      expiresAt: invite?.expires || expires,
    });
  } catch (error) {
    console.error("Error creating workspace invite:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}




