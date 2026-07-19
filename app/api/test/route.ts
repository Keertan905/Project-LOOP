import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

export async function GET() {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Reply with only: Groq is working!",
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        return NextResponse.json({
            success: true,
            response: chatCompletion.choices[0].message.content,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json({
            success: false,
            error: String(error),
        });
    }
}