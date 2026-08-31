import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { sendBookingStatusUpdateEmail } from "@/lib/email";

const ADMIN_USER_ID = "user_3FOCtiBnlnMNPZ1naaYqyDcUFpP";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    const existing = await prisma.booking.findUnique({ where: { id } });
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    if (existing && status && existing.status !== status) {
      await sendBookingStatusUpdateEmail({
        clientName: booking.name,
        clientEmail: booking.email,
        service: booking.service,
        bookingId: booking.id,
        status: booking.status,
      });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ error: "Failed to update booking." }, { status: 500 });
  }
}