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
    const quotes = await prisma.quote.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ quotes });
  }

  const quotes = await prisma.quote.findMany({
    where: { clerkUserId: userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ quotes });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, adminNotes } = await req.json();
  const quote = await prisma.quote.update({
    where: { id },
    data: { ...(status && { status }), ...(adminNotes !== undefined && { adminNotes }) },
  });
  return NextResponse.json({ quote });
}
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const {
      name, email, phone, service,
      woodSpecies, metalFinish, dimensions,
      budget, timeline, description, attachmentUrl,
    } = body;

    if (!name || !email || !phone || !service || !budget || !timeline || !description) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const quote = await prisma.quote.create({
      data: {
        name, email, phone, service,
        woodSpecies: woodSpecies ?? null,
        metalFinish: metalFinish ?? null,
        dimensions: dimensions ?? null,
        budget, timeline, description,
        attachmentUrl: attachmentUrl ?? null,
        clerkUserId: userId ?? null,
        status: "new",
      },
    });

    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error("Quote creation error:", error);
    await logServerError({
      message: error instanceof Error ? error.message : "Quote creation failed",
      stack: error instanceof Error ? error.stack : null,
      source: "server:quotes-post",
    });
    return NextResponse.json({ error: "Failed to submit quote." }, { status: 500 });
  }
}
