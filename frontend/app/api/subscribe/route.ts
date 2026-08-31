import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let isNewSubscriber = true;

    try {
      await prisma.subscriber.create({
        data: { email: normalizedEmail },
      });
    } catch (err: unknown) {
      // Prisma unique constraint violation = already subscribed.
      // Treat this as a success from the user's perspective.
      const isDuplicate =
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "P2002";

      if (!isDuplicate) throw err;
      isNewSubscriber = false;
    }

    if (isNewSubscriber) {
      // Fire-and-forget: don't let a slow/failed email delay the response.
      sendNewsletterWelcomeEmail(normalizedEmail).catch((err) =>
        console.error("Welcome email failed:", err)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}
