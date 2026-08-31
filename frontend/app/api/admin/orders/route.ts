import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

const ADMIN_USER_ID = "user_3FOCtiBnlnMNPZ1naaYqyDcUFpP";

export async function GET() {
  const { userId } = await auth();
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  const existing = await prisma.order.findUnique({ where: { id } });
  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  if (existing && status && existing.status !== status) {
    await sendOrderStatusUpdateEmail({
      clientName: order.name,
      clientEmail: order.email,
      orderId: order.id,
      status: order.status,
    });
  }

  return NextResponse.json({ order });
}