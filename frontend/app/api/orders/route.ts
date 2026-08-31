import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { logServerError } from "@/lib/errorLog";

const ADMIN_USER_ID = "user_3FOCtiBnlnMNPZ1naaYqyDcUFpP";

async function isAdmin() {
  const { userId } = await auth();
  return userId === ADMIN_USER_ID;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (await isAdmin()) {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ orders });
  }

  const orders = await prisma.order.findMany({
    where: { clerkUserId: userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  const order = await prisma.order.update({ where: { id }, data: { status } });
  return NextResponse.json({ order });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { name, email, phone, address, items, totalAmount, paymentMethod } = body;

    if (!name || !email || !phone || !items || !totalAmount || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        name,
        email,
        phone,
        address: address ?? null,
        items,
        totalAmount,
        paymentMethod,
        clerkUserId: userId ?? null,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order creation error:", error);
    await logServerError({
      message: error instanceof Error ? error.message : "Order creation failed",
      stack: error instanceof Error ? error.stack : null,
      source: "server:orders-post",
    });
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}