"use client";

/**
 * Best-effort client-side error reporter. Fires a fetch to /api/log-error
 * and never throws — a failed report should never itself break the page.
 */
export function reportClientError(error: unknown, extra?: { url?: string }) {
  try {
    const message =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown client error";
    const stack = error instanceof Error ? error.stack ?? null : null;

    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        stack,
        url: extra?.url ?? (typeof window !== "undefined" ? window.location.href : undefined),
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Swallow — reporting must never throw.
  }
}
