"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/reportClientError";

/**
 * Catches JS errors and unhandled promise rejections that happen outside
 * React's render tree (e.g. inside event handlers, async callbacks,
 * setTimeout) — cases the app/error.tsx boundary never sees.
 * Renders nothing; mount once near the root of the app.
 */
export default function ErrorTracker() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportClientError(event.error ?? event.message);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      reportClientError(event.reason);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
