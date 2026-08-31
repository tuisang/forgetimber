import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(`track:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Too many lookup attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const { id, email } = await req.json();

    if (!id || !email || typeof id !== "string" || typeof email !== "string") {
      return NextResponse.json({ error: "An ID and email are required." }, { status: 400 });
    }

    const normalizedId = id.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const [booking, order, quote] = await Promise.all([
      prisma.booking.findFirst({ where: { id: normalizedId, email: { equals: normalizedEmail, mode: "insensitive" } } }),
      prisma.order.findFirst({ where: { id: normalizedId, email: { equals: normalizedEmail, mode: "insensitive" } } }),
      prisma.quote.findFirst({ where: { id: normalizedId, email: { equals: normalizedEmail, mode: "insensitive" } } }),
    ]);

    const result = booking
      ? { type: "booking" as const, record: booking }
      : order
      ? { type: "order" as const, record: order }
      : quote
      ? { type: "quote" as const, record: quote }
      : null;

    if (!result) {
      // Deliberately generic — never confirm whether the ID or email exists
      // individually, only whether the combination matches.
      return NextResponse.json(
        { error: "No matching record found. Double-check the ID and email address." },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Track lookup error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
