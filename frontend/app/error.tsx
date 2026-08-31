"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportClientError } from "@/lib/reportClientError";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
    reportClientError(error);
  }, [error]);

  return (
    <main className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* Animated error icon */}
      <div className="mb-8 relative">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e8bf9b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div className="absolute inset-0 rounded-full border border-[#e8bf9b]/20 animate-ping" />
      </div>

      <p className="text-xs text-[#ffb785] tracking-[0.3em] mb-4" style={{ fontFamily: "JetBrains Mono, monospace" }}>
        SYSTEM ERROR
      </p>
      <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
        Something Went Wrong
      </h1>
      <p className="text-[#9c8e84] max-w-md mb-3 leading-relaxed">
        An unexpected error occurred in the atelier. Our team has been notified and is working to resolve it.
      </p>
      {error.digest && (
        <p className="text-xs text-[#4f453d] mb-8" style={{ fontFamily: "JetBrains Mono, monospace" }}>
          ERROR ID: {error.digest}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <button
          onClick={reset}
          className="bg-[#e8bf9b] text-[#442b12] px-8 py-3 text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-2"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          ↺ TRY AGAIN
        </button>
        <Link
          href="/"
          className="border border-[#4f453d] text-[#d3c4b9] px-8 py-3 text-sm font-semibold hover:border-[#e8bf9b] hover:text-[#e8bf9b] transition-all"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          ← GO HOME
        </Link>
      </div>

      <div className="mt-12 p-4 bg-[#20201f] border border-[#4f453d]/40 max-w-sm">
        <p className="text-xs text-[#9c8e84] mb-2">Need help? Contact us directly:</p>
        <a href="tel:+254726461196" className="text-sm text-[#e8bf9b] hover:underline block">+254 726 461 196</a>
        <a href="mailto:alex2000rui@gmail.com" className="text-sm text-[#e8bf9b] hover:underline block">alex2000rui@gmail.com</a>
      </div>
    </main>
  );
}
