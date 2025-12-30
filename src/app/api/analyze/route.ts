import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "SafeClick API is live (SRC_APP)"
  });
}

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: "POST working from src/app/api"
  });
}
