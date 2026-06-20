"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Footer from "@/components/Footer";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  service?: string;
  createdAt: string;
}

function StarRating({ rating, interactive = false, onRate }: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`transition-colors ${interactive ? "cursor-pointer" : "cursor-default"}`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={star <= (hovered || rating) ? "#e8bf9b" : "none"}
            stroke="#e8bf9b"
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { user, isLoaded } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [form, setForm] = useState({
    authorName: "",
    authorEmail: "",
    rating: 0,
    title: "",
    body: "",
    service: "",
  });
  const [errors, setErrors] = useState<{
    authorName?: string;
    rating?: string;
    title?: string;
    body?: string;
  }>({});

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        authorName: user.fullName ?? "",
        authorEmail: user.primaryEmailAddress?.emailAddress ?? "",
      }));
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!form.authorName.trim()) newErrors.authorName = "Please enter your name.";
    if (!form.rating) newErrors.rating = "Please select a star rating.";
    if (!form.title.trim()) newErrors.title = "Please add a short title for your review.";
    if (!form.body.trim()) newErrors.body = "Please write your review.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setSubmitStatus("submitting");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitStatus("success");
      setShowForm(false);
    } catch {
      setSubmitStatus("error");
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="bg-[#131313] text-[#e5e2e1] min-h-screen">
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}
      />

      <div className="relative z-10 pt-32 pb-24 max-w-[1440px] mx-auto px-4 md:px-16">

        {/* Header */}
        <header className="mb-16">
          <span className="text-xs text-[#ffb785] uppercase tracking-[0.2em] mb-4 block" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            Client Testimonials
          </span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: "Playfair Display, serif" }}>
                What Our Clients Say
              </h1>
              <div className="flex items-center gap-4 mt-4">
                <StarRating rating={Math.round(Number(avgRating))} />
                <span className="text-2xl font-bold text-[#e8bf9b]">{avgRating}</span>
                <span className="text-[#9c8e84] text-sm">({reviews.length} reviews)</span>
              </div>
            </div>
            {isLoaded && user ? (
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex-shrink-0 bg-[#e8bf9b] text-[#442b12] px-8 py-3 text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                Write a Review
              </button>
            ) : (
              <Link href="/" className="flex-shrink-0 border border-[#e8bf9b] text-[#e8bf9b] px-8 py-3 text-sm font-semibold hover:bg-[#e8bf9b]/10 transition-all">
                Sign in to Review
              </Link>
            )}
          </div>
        </header>

        {/* Success message */}
        {submitStatus === "success" && (
          <div className="mb-8 p-6 bg-[#20201f] border-l-4 border-[#e8bf9b] flex items-center gap-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8bf9b" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div>
              <p className="font-semibold text-[#e8bf9b]">Review Submitted!</p>
              <p className="text-sm text-[#d3c4b9]">Your review is pending approval and will appear shortly.</p>
            </div>
          </div>
        )}

        {/* Error message (submission failed after passing validation) */}
        {submitStatus === "error" && (
          <div className="mb-8 p-6 bg-[#20201f] border-l-4 border-red-500 flex items-center gap-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <p className="font-semibold text-red-400">Something went wrong.</p>
              <p className="text-sm text-[#d3c4b9]">We couldn&apos;t submit your review. Please try again in a moment.</p>
            </div>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="mb-12 bg-[#20201f] border border-[#4f453d]/40 border-t-2 border-t-[#e8bf9b] p-8">
            <h2 className="text-2xl font-semibold mb-8" style={{ fontFamily: "Playfair Display, serif" }}>
              Share Your Experience
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs text-[#d3c4b9] mb-2 block tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.authorName}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, authorName: e.target.value }));
                    if (errors.authorName) setErrors((prev) => ({ ...prev, authorName: undefined }));
                  }}
                  className={`w-full bg-[#131313] border-b py-2 text-[#e5e2e1] placeholder-[#9c8e84] outline-none transition-colors ${
                    errors.authorName ? "border-red-500" : "border-[#4f453d] focus:border-[#e8bf9b]"
                  }`}
                />
                {errors.authorName && (
                  <p className="text-red-400 text-xs mt-1">{errors.authorName}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-[#d3c4b9] mb-2 block tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.authorEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, authorEmail: e.target.value }))}
                  className="w-full bg-[#131313] border-b border-[#4f453d] focus:border-[#e8bf9b] py-2 text-[#e5e2e1] placeholder-[#9c8e84] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs text-[#d3c4b9] mb-2 block tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>YOUR RATING *</label>
                <StarRating
                  rating={form.rating}
                  interactive
                  onRate={(r) => {
                    setForm((prev) => ({ ...prev, rating: r }));
                    if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }));
                  }}
                />
                {errors.rating && (
                  <p className="text-red-400 text-xs mt-1">{errors.rating}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-[#d3c4b9] mb-2 block tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>SERVICE USED</label>
                <select
                  value={form.service}
                  onChange={(e) => setForm((prev) => ({ ...prev, service: e.target.value }))}
                  className="w-full bg-[#131313] border-b border-[#4f453d] focus:border-[#e8bf9b] py-2 text-[#e5e2e1] outline-none transition-colors"
                >
                  <option value="">Select service</option>
                  <option value="furniture">Bespoke Furniture</option>
                  <option value="metal">Architectural Metal</option>
                  <option value="restoration">Restoration</option>
                  <option value="interior">Interior Installation</option>
                  <option value="welding">Precision Welding</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs text-[#d3c4b9] mb-2 block tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>REVIEW TITLE *</label>
              <input
                type="text"
                placeholder="e.g. 'Beautiful dining table, exceeded expectations'"
                value={form.title}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, title: e.target.value }));
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={`w-full bg-[#131313] border-b py-2 text-[#e5e2e1] placeholder-[#9c8e84] outline-none transition-colors ${
                  errors.title ? "border-red-500" : "border-[#4f453d] focus:border-[#e8bf9b]"
                }`}
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div className="mb-8">
              <label className="text-xs text-[#d3c4b9] mb-2 block tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>YOUR REVIEW *</label>
              <textarea
                placeholder="Tell us about your experience with Forge & Timber..."
                value={form.body}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, body: e.target.value }));
                  if (errors.body) setErrors((prev) => ({ ...prev, body: undefined }));
                }}
                rows={4}
                className={`w-full bg-[#131313] border p-4 text-[#e5e2e1] placeholder-[#9c8e84] outline-none transition-colors resize-none ${
                  errors.body ? "border-red-500" : "border-[#4f453d] focus:border-[#e8bf9b]"
                }`}
              />
              {errors.body && (
                <p className="text-red-400 text-xs mt-1">{errors.body}</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={submitStatus === "submitting"}
                className="bg-[#e8bf9b] text-[#442b12] px-10 py-3 text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {submitStatus === "submitting" ? "SUBMITTING..." : "SUBMIT REVIEW"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setErrors({});
                }}
                className="border border-[#4f453d] text-[#d3c4b9] px-8 py-3 text-sm hover:border-[#e8bf9b] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reviews Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-3">
              {[0,1,2].map((i) => (
                <div key={i} className="w-3 h-3 bg-[#e8bf9b] rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-32 text-center">
            <svg className="mx-auto mb-6 text-[#4f453d]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "Playfair Display, serif" }}>No reviews yet</h3>
            <p className="text-[#9c8e84] mb-8">Be the first to share your Forge & Timber experience.</p>
            {user && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#e8bf9b] text-[#442b12] px-10 py-3 text-sm font-semibold"
              >
                Write First Review
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[#20201f] border border-[#4f453d]/40 p-6 flex flex-col hover:border-[#e8bf9b]/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <StarRating rating={review.rating} />
                  {review.service && (
                    <span className="text-[10px] px-2 py-1 border border-[#4f453d] text-[#9c8e84] capitalize" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {review.service}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
                  {review.title}
                </h3>
                <p className="text-[#d3c4b9] text-sm leading-relaxed flex-1 mb-6">
                  &ldquo;{review.body}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#4f453d]/30">
                  <div className="w-8 h-8 bg-[#e8bf9b]/20 border border-[#e8bf9b]/30 flex items-center justify-center">
                    <span className="text-[#e8bf9b] text-sm font-bold">
                      {review.authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{review.authorName}</p>
                    <p className="text-xs text-[#9c8e84]">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-20 text-center">
          <p className="text-[#d3c4b9] mb-6">Ready to experience the Forge &amp; Timber difference?</p>
          <Link
            href="/booking"
            className="bg-[#e8bf9b] text-[#442b12] px-12 py-4 text-sm font-semibold hover:brightness-110 transition-all inline-block"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            BOOK A CONSULTATION →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
