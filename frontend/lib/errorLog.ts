import { prisma } from "@/lib/prisma";

interface LogErrorInput {
  message: string;
  stack?: string | null;
  source?: string;
  url?: string | null;
  userAgent?: string | null;
  clerkUserId?: string | null;
}

/**
 * Best-effort server-side error logger. Never throws — a failure here
 * should never take down the request that triggered it.
 */
export async function logServerError(input: LogErrorInput) {
  try {
    await prisma.errorLog.create({
      data: {
        message: input.message.slice(0, 2000),
        stack: input.stack?.slice(0, 5000) ?? null,
        source: input.source ?? "server",
        url: input.url ?? null,
        userAgent: input.userAgent ?? null,
        clerkUserId: input.clerkUserId ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to persist error log:", err);
  }
}
