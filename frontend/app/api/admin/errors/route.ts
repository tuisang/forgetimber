import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const ADMIN_USER_ID = "user_3FOCtiBnlnMNPZ1naaYqyDcUFpP";

export async function GET() {
  const { userId } = await auth();
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const errors = await prisma.errorLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ errors });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (id) {
    await prisma.errorLog.delete({ where: { id } });
  } else {
    await prisma.errorLog.deleteMany({});
  }
  return NextResponse.json({ success: true });
}
