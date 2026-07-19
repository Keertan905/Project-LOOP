import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { retrieveFeedback } from "@/lib/search";
import { answerQuestion } from "@/lib/ai";

const askQuestionSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = askQuestionSchema.parse(body);

    const workspaceId = session.user.workspaceId;

    // 1. Retrieve the top 5 most relevant feedback records
    const sources = await retrieveFeedback(workspaceId, validatedData.question, 5);

    // 2. Formulate the grounded answer
    const answer = await answerQuestion(validatedData.question, sources);

    return NextResponse.json({
      answer,
      sources: sources.map((s) => ({
        id: s.id,
        content: s.content,
        channel: s.channel,
        customerLabel: s.customerLabel,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error generating Ask LOOP response:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
