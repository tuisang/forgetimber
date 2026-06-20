"use client";

import { useState } from "react";
import Footer from "@/components/Footer";

interface FormData {
  name: string;
  phone: string;
  email: string;
}

type SubmitStatus = "idle" | "creating" | "stk_sent" | "confirmed" | "error";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: "", phone: "", email: "" });
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleInput = (field: keyof FormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const formatSelectedDate = (date: Date | null) => {
    if (!date) return "Not selected";
    return date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  };

  const handleSubmit = async () => {
    if (!selectedService) return setErrorMsg("Please select a service.");
    if (!formData.name || !formData.phone || !formData.email)
      return setErrorMsg("Please fill in all contact fields.");

    setErrorMsg(null);
    setSubmitStatus("creating");

    try {
      // Step 1: Create booking in DB
      // Upload file first if present
      let attachmentUrl = null;
      if (uploadedFile) {
        setIsUploading(true);
        const fd = new FormData();
        fd.append("file", uploadedFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (uploadData.url) attachmentUrl = uploadData.url;
        setIsUploading(false);
      }

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          service: selectedService,
          date: selectedDate ? selectedDate.toISOString() : "TBD",
          paymentMethod,
          attachmentUrl,
        }),
      });

      if (!bookingRes.ok) throw new Error("Failed to create booking.");
      const { booking } = await bookingRes.json();
      setBookingId(booking.id);

      // Step 2: If M-Pesa, trigger STK push
      if (paymentMethod === "mpesa") {
        setSubmitStatus("stk_sent");

        const stkRes = await fetch("/api/mpesa/stk-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: formData.phone,
            bookingId: booking.id,
          }),
        });

        const stkData = await stkRes.json();

        if (!stkRes.ok) throw new Error(stkData.error ?? "STK push failed.");

        setCheckoutId(stkData.checkoutRequestId);

        // Poll for payment confirmation every 3 seconds
        pollPaymentStatus(booking.id);
      } else {
        setSubmitStatus("confirmed");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitStatus("error");
    }
  };

  const pollPaymentStatus = (id: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/bookings/${id}`);
        const data = await res.json();
        if (data.booking?.status === "confirmed") {
          setSubmitStatus("confirmed");
          clearInterval(interval);
        } else if (data.booking?.status === "pending" && attempts > 5) {
          // Payment likely cancelled
          setSubmitStatus("error");
          setErrorMsg("Payment was not completed. Please try again.");
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
      if (attempts >= 10) clearInterval(interval);
    }, 3000);
  };

  const isSubmitting = submitStatus === "creating" || submitStatus === "stk_sent";

  return (
    <main className="bg-[#131313] text-[#e5e2e1] relative">
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.05]"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-matter.png')" }}
      />

      <div className="relative z-10 pt-32 pb-24 max-w-[1440px] mx-auto px-4 md:px-16">
        {/* Header */}
        <header className="mb-16">
          <span className="text-xs text-[#ffb785] uppercase tracking-[0.2em] mb-4 block" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            Secure Reservation
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight" style={{ fontFamily: "Playfair Display, serif", letterSpacing: "-0.02em" }}>
            Secure Your Masterpiece Consultation.
          </h1>
          <p className="text-lg text-[#d3c4b9] max-w-2xl leading-relaxed">
            Connect with our head artisans to discuss bespoke woodworking and structural metal forging.
          </p>
        </header>

        {/* STK Push Waiting State */}
        {submitStatus === "stk_sent" && (
          <div className="mb-10 p-8 bg-[#20201f] border border-[#4f453d] border-l-4 border-l-[#39b54a]">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 bg-[#39b54a]/10 border border-[#39b54a]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <p className="font-semibold text-lg text-[#39b54a] mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                  Check Your Phone
                </p>
                <p className="text-[#d3c4b9] mb-3">
                  An M-Pesa STK push has been sent to <span className="text-[#e8bf9b] font-semibold">{formData.phone}</span>. Enter your M-Pesa PIN to confirm payment of <span className="text-[#e8bf9b] font-semibold">KES 5,000</span>.
                </p>
                <div className="flex items-center gap-3 text-sm text-[#9c8e84]">
                  <div className="flex gap-1">
                    {[0,1,2].map((i) => (
                      <div key={i} className="w-2 h-2 bg-[#39b54a] rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: "JetBrains Mono, monospace" }}>WAITING FOR CONFIRMATION...</span>
                </div>
                {checkoutId && (
                  <p className="text-xs text-[#4f453d] mt-3" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    REF: {checkoutId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {submitStatus === "confirmed" && (
          <div className="mb-10 p-8 bg-[#20201f] border border-[#4f453d] border-l-4 border-l-[#e8bf9b]">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 bg-[#e8bf9b]/10 border border-[#e8bf9b]/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#e8bf9b] text-3xl">check_circle</span>
              </div>
              <div>
                <p className="font-semibold text-xl text-[#e8bf9b] mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                  Booking Confirmed!
                </p>
                <p className="text-[#d3c4b9] mb-2">
                  Your consultation has been booked successfully. We&apos;ll reach out to{" "}
                  <span className="text-[#e8bf9b]">{formData.email}</span> shortly.
                </p>
                {bookingId && (
                  <p className="text-xs text-[#9c8e84]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    BOOKING ID: {bookingId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {(submitStatus === "error" || errorMsg) && (
          <div className="mb-10 p-6 bg-[#20201f] border-l-4 border-red-500 flex items-center gap-4">
            <span className="material-symbols-outlined text-red-400 text-3xl">error</span>
            <div>
              <p className="font-semibold text-red-400">Error</p>
              <p className="text-sm text-[#d3c4b9]">{errorMsg ?? "Something went wrong. Please try again."}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-7 space-y-12">

            {/* Step 1: Service */}
            <section className="p-8 md:p-12 relative overflow-hidden" style={{ background: "rgba(32,32,31,0.7)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(232,191,155,0.1)" }}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-9xl">carpenter</span>
              </div>
              <h2 className="text-3xl font-semibold mb-8 flex items-center gap-3" style={{ fontFamily: "Playfair Display, serif" }}>
                <span className="text-[#e8bf9b] text-xl font-medium" style={{ fontFamily: "JetBrains Mono, monospace" }}>01</span>
                Service Selection
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: "furniture", icon: "chair_alt", title: "Bespoke Furniture", desc: "Custom tables, seating, and cabinetry crafted from kiln-dried hardwoods." },
                  { id: "metal", icon: "architecture", title: "Architectural Metal", desc: "Industrial stairs, railings, and structural accents in steel and copper." },
                ].map((service) => (
                  <div
                    key={service.id}
                    onClick={() => !isSubmitting && setSelectedService(service.id)}
                    className={`cursor-pointer border p-6 transition-all bg-[#1c1b1b] ${
                      selectedService === service.id ? "border-[#e8bf9b]" : "border-[#4f453d] hover:border-[#e8bf9b]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="material-symbols-outlined text-[#e8bf9b] text-3xl">{service.icon}</span>
                      <div className={`w-4 h-4 rounded-full border transition-colors ${selectedService === service.id ? "bg-[#e8bf9b] border-[#e8bf9b]" : "border-[#9c8e84]"}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>{service.title}</h3>
                    <p className="text-[#d3c4b9] text-sm">{service.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Step 2: Schedule & Contact */}
            <section className="p-8 md:p-12" style={{ background: "rgba(32,32,31,0.7)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(232,191,155,0.1)" }}>
              <h2 className="text-3xl font-semibold mb-8 flex items-center gap-3" style={{ fontFamily: "Playfair Display, serif" }}>
                <span className="text-[#e8bf9b] text-xl font-medium" style={{ fontFamily: "JetBrains Mono, monospace" }}>02</span>
                Schedule &amp; Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Calendar */}
                <div>
                  <label className="text-xs text-[#d3c4b9] mb-4 block tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>Select Date</label>
                  <div className="bg-[#2a2a2a] p-4 border border-[#4f453d]">
                    <div className="flex justify-between items-center mb-6 px-2">
                      <span className="font-bold">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                      <div className="flex gap-4">
                        <span
                          onClick={goToPrevMonth}
                          className="material-symbols-outlined cursor-pointer hover:text-[#e8bf9b]"
                        >
                          chevron_left
                        </span>
                        <span
                          onClick={goToNextMonth}
                          className="material-symbols-outlined cursor-pointer hover:text-[#e8bf9b]"
                        >
                          chevron_right
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs text-[#9c8e84] mb-4" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {["S","M","T","W","T","F","S"].map((d, i) => <span key={i}>{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-sm">
                      {Array.from({ length: getFirstWeekday(viewYear, viewMonth) }, (_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: getDaysInMonth(viewYear, viewMonth) }, (_, i) => i + 1).map((d) => {
                        const cellDate = new Date(viewYear, viewMonth, d);
                        const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const isSelected =
                          selectedDate &&
                          selectedDate.getDate() === d &&
                          selectedDate.getMonth() === viewMonth &&
                          selectedDate.getFullYear() === viewYear;

                        return (
                          <div
                            key={d}
                            onClick={() => !isSubmitting && !isPast && setSelectedDate(cellDate)}
                            className={`py-2 transition-colors ${
                              isPast
                                ? "text-[#4f453d] cursor-not-allowed"
                                : isSelected
                                ? "bg-[#e8bf9b] text-[#442b12] font-bold cursor-pointer"
                                : "cursor-pointer hover:bg-[#8c6a4c]/30 hover:text-[#e8bf9b]"
                            }`}
                          >
                            {d}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="space-y-6">
                  {[
                    { label: "Full Name", placeholder: "Johnathan Doe", type: "text", field: "name" as keyof FormData },
                    { label: "Phone (For M-Pesa STK)", placeholder: "+254 7XX XXX XXX", type: "tel", field: "phone" as keyof FormData },
                    { label: "Email Address", placeholder: "alex2000rui@gmail.com", type: "email", field: "email" as keyof FormData },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-xs text-[#d3c4b9] mb-1 block tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={formData[f.field]}
                        onChange={(e) => handleInput(f.field, e.target.value)}
                        disabled={isSubmitting}
                        className="w-full py-2 bg-transparent border-b border-[#4f453d] focus:border-[#ffb785] outline-none text-[#e5e2e1] placeholder-[#9c8e84] transition-all disabled:opacity-50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right: Summary & Payment */}
          <aside className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="bg-[#2a2a2a] border border-[#4f453d] p-8">
                <h3 className="text-2xl font-semibold mb-6 pb-4 border-b border-[#4f453d]" style={{ fontFamily: "Playfair Display, serif" }}>
                  Booking Summary
                </h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-[#d3c4b9]">Service</span>
                    <span className="text-xs tracking-widest capitalize" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {selectedService ?? "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#d3c4b9]">Date</span>
                    <span className="text-xs tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {formatSelectedDate(selectedDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#d3c4b9]">Consultation Fee</span>
                    <span className="text-xs tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>KES 5,000.00</span>
                  </div>
                  <div className="flex justify-between text-[#e8bf9b] font-bold pt-4 border-t border-[#4f453d]/30">
                    <span>Total Payable</span>
                    <span>KES 5,000.00</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4 mb-8">
                  <label className="text-xs text-[#d3c4b9] mb-2 block tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    Payment Method
                  </label>
                  {[
                    { id: "mpesa", label: "M-Pesa STK Push", badge: <span className="h-6 w-12 bg-[#39b54a] flex items-center justify-center text-[8px] font-bold text-white">M-PESA</span> },
                    { id: "card", label: "Visa / Mastercard", badge: <span className="material-symbols-outlined text-xl">credit_card</span> },
                    { id: "paypal", label: "PayPal", badge: <span className="material-symbols-outlined text-xl">payments</span> },
                  ].map((method) => (
                    <label
                      key={method.id}
                      onClick={() => !isSubmitting && setPaymentMethod(method.id)}
                      className="flex items-center justify-between p-4 border border-[#4f453d] cursor-pointer hover:bg-[#20201f] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full border transition-colors ${paymentMethod === method.id ? "bg-[#e8bf9b] border-[#e8bf9b]" : "border-[#9c8e84]"}`} />
                        <span className="font-semibold text-sm">{method.label}</span>
                      </div>
                      {method.badge}
                    </label>
                  ))}
                </div>

                {/* M-Pesa info banner */}
                {paymentMethod === "mpesa" && submitStatus === "idle" && (
                  <div className="mb-6 p-4 bg-[#39b54a]/10 border border-[#39b54a]/30 flex gap-3">
                    <span className="text-lg">📱</span>
                    <p className="text-xs text-[#d3c4b9] leading-relaxed">
                      You will receive an M-Pesa prompt on <span className="text-[#e8bf9b]">{formData.phone || "your phone"}</span>. Enter your PIN to complete payment.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || submitStatus === "confirmed"}
                  className="w-full py-4 text-sm font-semibold uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: submitStatus === "confirmed" ? "#4f453d" : "#e8bf9b",
                    color: submitStatus === "confirmed" ? "#9c8e84" : "#442b12",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {submitStatus === "creating" && "Creating Booking..."}
                  {submitStatus === "stk_sent" && "⏳ Waiting for M-Pesa..."}
                  {submitStatus === "confirmed" && "✓ Booking Confirmed"}
                  {submitStatus === "error" && "Try Again"}
                  {submitStatus === "idle" && (paymentMethod === "mpesa" ? "Pay with M-Pesa" : "Complete Reservation")}
                </button>

                {/* Trust Badges */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    { icon: "shield", label: "SSL Secured", sub: "256-bit encryption" },
                    { icon: "verified", label: "Certified", sub: "Atelier Verified" },
                  ].map((badge) => (
                    <div key={badge.label} className="flex flex-col items-center p-4 border border-[#4f453d]/30 text-center">
                      <span className="material-symbols-outlined text-[#e8bf9b] mb-2">{badge.icon}</span>
                      <p className="text-xs font-semibold">{badge.label}</p>
                      <p className="text-[10px] text-[#9c8e84]">{badge.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  );
}
