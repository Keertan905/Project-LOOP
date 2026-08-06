import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Endpoint deprecated. Use /api/health instead." }, { status: 410 });
}