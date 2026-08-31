import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { logServerError } from "@/lib/errorLog";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const {
      name, phone, email, service,
      date, paymentMethod,
      attachmentUrl,
    } = body;

    if (!name || !phone || !email || !service || !date || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        name, phone, email, service,
        date, paymentMethod,
        clerkUserId: userId ?? null,
        attachmentUrl: attachmentUrl ?? null,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Booking creation error:", error);
    await logServerError({
      message: error instanceof Error ? error.message : "Booking creation failed",
      stack: error instanceof Error ? error.stack : null,
      source: "server:bookings-post",
    });
    return NextResponse.json({ error: "Failed to create booking." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ bookings: [] });
    }
    const bookings = await prisma.booking.findMany({
      where: { clerkUserId: userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings." }, { status: 500 });
  }
}