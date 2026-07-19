import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcrypt";

import { prisma } from "@/lib/prisma";

const signupSchema = z
  .object({
    workspace: z.string().min(2),
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

  //  Add the POST function here
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const data = signupSchema.parse(body);
    const existingUser = await prisma.user.findUnique({
  where: {
    email: data.email,
  },
});

if (existingUser) {
  return NextResponse.json(
    { error: "Email already registered" },
    { status: 409 }
  );
}
const hashedPassword = await hash(data.password, 10);
const workspace = await prisma.workspace.create({
  data: {
    name: data.workspace,
  },
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
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  },
  { status: 201 }
);

  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}