"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

const STATUS_COLORS: Record<string, string> = {
  pending: "#ffb785",
  awaiting_payment: "#facc15",
  confirmed: "#4ade80",
  completed: "#60a5fa",
  cancelled: "#f87171",
  paid: "#4ade80",
  processing: "#60a5fa",
  shipped: "#a78bfa",
  delivered: "#4ade80",
  failed: "#f87171",
  new: "#ffb785",
  reviewing: "#60a5fa",
  quoted: "#4ade80",
  accepted: "#4ade80",
  declined: "#f87171",
};

function statusColor(status: string) {
  return STATUS_COLORS[status] ?? "#9c8e84";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

interface LookupResult {
  type: "booking" | "order" | "quote";
  record: Record<string, any>;
}

export default function TrackPage() {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = { booking: "Booking", order: "Order", quote: "Quote Request" };

  return (
    <main className="min-h-screen bg-[#0e0e0e] text-[#e5e2e1]">
      <div className="max-w-xl mx-auto px-6 py-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Track Your Order</h1>
        <p className="text-[#9c8e84] mb-10">
          Enter your booking, order, or quote ID along with the email address you used, and we'll pull up the status.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-10">
          <div>
            <label className="block text-xs text-[#9c8e84] mb-2" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              BOOKING / ORDER / QUOTE ID
            </label>
            <input
              type="text"
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. cklz9x8h20000abcd1234efgh"
              className="w-full bg-[#1a1a1a] border border-[#4f453d] px-4 py-3 text-sm focus:outline-none focus:border-[#e8bf9b] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-[#9c8e84] mb-2" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#1a1a1a] border border-[#4f453d] px-4 py-3 text-sm focus:outline-none focus:border-[#e8bf9b] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e8bf9b] text-[#442b12] font-semibold px-6 py-3 hover:bg-[#e8bf9b]/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Looking up..." : "Track Status"}
          </button>
        </form>

        {error && (
          <div className="border border-[#f87171]/40 bg-[#f87171]/10 text-[#f87171] px-4 py-3 text-sm mb-8">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-[#20201f] border border-[#4f453d]/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#9c8e84]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                {typeLabel[result.type].toUpperCase()}
              </span>
              <span
                className="text-xs px-3 py-1 border"
                style={{
                  borderColor: statusColor(result.record.status),
                  color: statusColor(result.record.status),
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {String(result.record.status).replace(/_/g, " ").toUpperCase()}
              </span>
            </div>

            {result.type === "booking" && (
              <>
                <p className="font-semibold text-lg capitalize mb-1">{result.record.service}</p>
                <p className="text-sm text-[#9c8e84]">Date: {result.record.date}</p>
              </>
            )}
            {result.type === "order" && (
              <>
                <p className="font-semibold text-lg mb-1">
                  {Array.isArray(result.record.items) ? result.record.items.length : 0} item(s) &middot; KSh{" "}
                  {Number(result.record.totalAmount).toLocaleString()}
                </p>
                <p className="text-sm text-[#9c8e84]">Payment: {result.record.paymentMethod}</p>
              </>
            )}
            {result.type === "quote" && (
              <>
                <p className="font-semibold text-lg capitalize mb-1">{result.record.service}</p>
                <p className="text-sm text-[#9c8e84]">
                  Budget: {result.record.budget} &middot; Timeline: {result.record.timeline}
                </p>
              </>
            )}

            <p className="text-xs text-[#4f453d] mt-4">Submitted {formatDate(result.record.createdAt)}</p>
          </div>
        )}

        <p className="text-xs text-[#4f453d] mt-10">
          Have an account?{" "}
          <Link href="/dashboard" className="text-[#e8bf9b] hover:underline">
            Sign in to see all your orders at once
          </Link>
          .
        </p>
      </div>
      <Footer />
    </main>
  );
}
