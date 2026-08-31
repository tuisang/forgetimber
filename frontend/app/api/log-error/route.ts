import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logServerError } from "@/lib/errorLog";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth().catch(() => ({ userId: null as string | null }));
    const body = await req.json();
    const { message, stack, url } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "A message is required." }, { status: 400 });
    }

    await logServerError({
      message,
      stack: typeof stack === "string" ? stack : null,
      source: "client",
      url: typeof url === "string" ? url : null,
      userAgent: req.headers.get("user-agent"),
      clerkUserId: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Never let error-reporting itself throw a loud error back to the client.
    console.error("log-error route failed:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
