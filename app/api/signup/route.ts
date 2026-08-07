import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";

const standardSignupSchema = z
  .object({
    workspace: z.string().min(2, "Workspace name must be at least 2 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const inviteSignupSchema = z.object({
  inviteToken: z.string().min(1, "Invite token is required"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});


export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Handle Invited User Signup Flow
    if (body.inviteToken) {
      const parsed = inviteSignupSchema.parse(body);

      const prismaAny = prisma as any;

      // Verify invite token from DB
      const invite = await prismaAny.inviteToken?.findUnique?.({
        where: { token: parsed.inviteToken },
      });

      if (!invite) {
        return NextResponse.json(
          { error: "Invalid or expired invitation token." },
          { status: 400 }
        );
      }

      if (new Date() > new Date(invite.expires)) {
        return NextResponse.json(
          { error: "This invitation link has expired." },
          { status: 410 }
        );
      }

      const hashedPassword = await hash(parsed.password, 10);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: invite.email },
      });

      let user;
      if (existingUser) {
        // Update user to join this workspace with assigned role
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: parsed.name || existingUser.name,
            password: hashedPassword,
            role: invite.role,
            workspaceId: invite.workspaceId,
          },
        });
      } else {
        // Create new user in the inviting workspace
        user = await prisma.user.create({
          data: {
            name: parsed.name,
            email: invite.email,
            password: hashedPassword,
            role: invite.role,
            workspaceId: invite.workspaceId,
          },
        });
      }

      // Clean up used invite token safely using deleteMany to prevent errors
      try {
        if (prismaAny.inviteToken?.deleteMany) {
          await prismaAny.inviteToken.deleteMany({
            where: { token: parsed.inviteToken },
          });
        }
      } catch (err) {
        console.warn("Could not delete invite token post-signup:", err);
      }



      return NextResponse.json(
        {
          message: "Joined workspace successfully!",
          user: { id: user.id, email: user.email, name: user.name },
        },
        { status: 201 }
      );
    }

    // 2. Handle Standard New Workspace Signup Flow
    const data = standardSignupSchema.parse(body);
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(data.password, 10);
    const workspace = await prisma.workspace.create({
      data: { name: data.workspace },
    });

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message || "Invalid request data";
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}