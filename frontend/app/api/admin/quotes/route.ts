import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { sendQuoteStatusUpdateEmail } from "@/lib/email";

const ADMIN_USER_ID = "user_3FOCtiBnlnMNPZ1naaYqyDcUFpP";

export async function GET() {
  const { userId } = await auth();
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ quotes });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, adminNotes } = await req.json();
  const existing = await prisma.quote.findUnique({ where: { id } });
  const quote = await prisma.quote.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
    },
  });

  if (existing && status && existing.status !== status) {
    await sendQuoteStatusUpdateEmail({
      clientName: quote.name,
      clientEmail: quote.email,
      quoteId: quote.id,
      service: quote.service,
      status: quote.status,
    });
  }

  return NextResponse.json({ quote });
}