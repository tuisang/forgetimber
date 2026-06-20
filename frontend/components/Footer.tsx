"use client";

import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async () => {
  if (!email) return;
  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Failed");
    setSubscribed(true);
    setEmail("");
  } catch {
    alert("Something went wrong subscribing. Please try again.");
  }
};

  const Logo = () => (
    <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
      <polygon points="18,2 32,10 32,26 18,34 4,26 4,10" fill="#20201f" stroke="#e8bf9b" strokeWidth="1.5"/>
      <line x1="10" y1="13" x2="26" y2="13" stroke="#4f453d" strokeWidth="1" strokeLinecap="round"/>
      <line x1="8" y1="17" x2="28" y2="17" stroke="#4f453d" strokeWidth="1" strokeLinecap="round"/>
      <line x1="10" y1="21" x2="26" y2="21" stroke="#4f453d" strokeWidth="1" strokeLinecap="round"/>
      <circle cx="18" cy="17" r="4" fill="none" stroke="#e8bf9b" strokeWidth="1.5"/>
      <circle cx="18" cy="17" r="1.5" fill="#e8bf9b"/>
      <circle cx="10" cy="10" r="1.2" fill="#e8bf9b" opacity="0.6"/>
      <circle cx="26" cy="10" r="1.2" fill="#e8bf9b" opacity="0.6"/>
      <circle cx="10" cy="24" r="1.2" fill="#e8bf9b" opacity="0.6"/>
      <circle cx="26" cy="24" r="1.2" fill="#e8bf9b" opacity="0.6"/>
    </svg>
  );

  return (
    <footer style={{ background: "#0a0a0a", borderTop: "1px solid rgba(79,69,61,0.5)" }}>

      {/* Top CTA Banner */}
      <div style={{ borderBottom: "1px solid rgba(79,69,61,0.3)", background: "rgba(232,191,155,0.04)" }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
              Ready to commission a masterpiece?
            </p>
            <p className="text-[#9c8e84] text-sm mt-1">Speak with our master artisans today.</p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <Link
              href="/booking"
              className="bg-[#e8bf9b] text-[#442b12] px-8 py-3 text-sm font-semibold hover:brightness-110 transition-all active:scale-95"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              BOOK CONSULTATION
            </Link>
            <Link
              href="/portfolio"
              className="border border-[#4f453d] text-[#d3c4b9] px-8 py-3 text-sm font-semibold hover:border-[#e8bf9b] hover:text-[#e8bf9b] transition-all"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              VIEW PORTFOLIO
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Brand Column */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <Logo />
              <div>
                <p className="text-[#e8bf9b] font-bold text-xl leading-none" style={{ fontFamily: "Playfair Display, serif" }}>
                  Forge &amp; Timber
                </p>
                <p className="text-[9px] text-[#9c8e84] tracking-[0.2em] mt-0.5" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  ATELIER · NAIROBI
                </p>
              </div>
            </Link>
            <p className="text-[#d3c4b9] text-sm leading-relaxed mb-8 max-w-xs">
              An atelier dedicated to the craft of enduring objects. Made for those who value the weight of steel and the soul of timber.
            </p>

            {/* Single Contact Block */}
            <div className="space-y-3 mb-8">
              <a
                href="tel:+254726461196"
                className="flex items-center gap-3 text-sm text-[#d3c4b9] hover:text-[#e8bf9b] transition-colors group"
              >
                <div className="w-8 h-8 border border-[#4f453d] group-hover:border-[#e8bf9b] flex items-center justify-center transition-colors flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                +254 726 461 196
              </a>
              <div className="flex items-center gap-3 text-sm text-[#d3c4b9]">
                <div className="w-8 h-8 border border-[#4f453d] flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                Embakasi Aviation, Nairobi
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                {
                  label: "TikTok",
                  path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z",
                },
                {
  label: "Instagram",
  href: "https://www.instagram.com/forgeandtimberartelier/",
  path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z",
},
                {
                  label: "YouTube",
                  path: "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z M9.75 15.02l5.75-3.02-5.75-3.02v6.04z",
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-9 h-9 border border-[#4f453d] hover:border-[#e8bf9b] flex items-center justify-center text-[#d3c4b9] hover:text-[#e8bf9b] transition-all"
                  aria-label={social.label}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2">
            <h4
              className="text-[#e5e2e1] text-xs font-medium tracking-widest mb-6"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              NAVIGATE
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Services", href: "/services" },
                { label: "Portfolio", href: "/portfolio" },
                { label: "Materials", href: "/catalog" },
                { label: "Reviews", href: "/reviews" },
                { label: "Book Consultation", href: "/booking" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#d3c4b9] hover:text-[#e8bf9b] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-300">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e8bf9b" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-2">
            <h4
              className="text-[#e5e2e1] text-xs font-medium tracking-widest mb-6"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              SERVICES
            </h4>
            <ul className="space-y-3">
              {[
  { label: "Custom Furniture", anchor: "custom-furniture" },
  { label: "Wood-Metal Décor", anchor: "wood-metal-decor" },
  { label: "Industrial Fabrication", anchor: "industrial-fabrication" },
  { label: "Restoration & Repairs", anchor: "restoration-repairs" },
  { label: "Precision Welding", anchor: "precision-welding" },
  { label: "Commercial Installations", anchor: "commercial-installations" },
].map((item) => (
  <li key={item.anchor}>
    <Link
      href={`/services#${item.anchor}`}
      className="text-[#d3c4b9] hover:text-[#e8bf9b] transition-colors text-sm flex items-center gap-2 group"
    >
      <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-300">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e8bf9b" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </span>
      {item.label}
    </Link>
  </li>
))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4">
            <h4
              className="text-[#e5e2e1] text-xs font-medium tracking-widest mb-6"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              JOIN THE ATELIER
            </h4>
            <p className="text-sm text-[#d3c4b9] mb-6 leading-relaxed">
              Subscribe for first access to limited edition creations, behind-the-scenes workshops, and exclusive tool releases.
            </p>

            {subscribed ? (
              <div className="border border-[#e8bf9b]/30 bg-[#e8bf9b]/5 px-6 py-4 flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8bf9b" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <p className="text-sm text-[#e8bf9b]">You&apos;re on the list. Welcome to the Atelier.</p>
              </div>
            ) : (
              <div>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                    className="bg-[#131313] border border-[#4f453d] focus:border-[#e8bf9b] outline-none px-4 py-3 flex-grow text-sm text-[#e5e2e1] placeholder-[#9c8e84] transition-all"
                  />
                  <button
                    onClick={handleSubscribe}
                    className="bg-[#e8bf9b] text-[#442b12] px-6 py-3 text-sm font-semibold hover:brightness-110 transition-all flex-shrink-0"
                  >
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-[#4f453d] mt-2">No spam. Unsubscribe anytime.</p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "SSL Secured", sub: "256-bit encryption" },
                {
                  icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z",
                  label: "M-Pesa Ready",
                  sub: "Instant payments",
                },
                {
                  icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
                  label: "Expert Artisans",
                  sub: "15+ years experience",
                },
                {
                  icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
                  label: "Nairobi Based",
                  sub: "Local craftsmanship",
                },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-3 p-3 border border-[#4f453d]/40">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e8bf9b"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <path d={badge.icon} />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-[#e5e2e1]">{badge.label}</p>
                    <p className="text-[10px] text-[#9c8e84]">{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div style={{ borderTop: "1px solid rgba(79,69,61,0.3)" }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

            {/* Contact Info */}
            <div className="md:col-span-4 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
                  Find Our Atelier
                </h3>
                <p className="text-[#d3c4b9] text-sm leading-relaxed">
                  Visit our workshop in Embakasi, Nairobi. We welcome clients by appointment — book a consultation to arrange a visit.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  {
                    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                    label: "Embakasi Aviation, Nairobi",
                  },
                  {
                    icon: "M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z M12 6v6l4 2",
                    label: "Mon–Fri: 8am–6pm · Sat: 9am–3pm",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 border border-[#4f453d] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#e8bf9b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={item.icon} />
                      </svg>
                    </div>
                    <p className="text-sm text-[#d3c4b9] leading-relaxed">{item.label}</p>
                  </div>
                ))}
              </div>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=-1.2921,36.8219"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-[#e8bf9b] border border-[#e8bf9b]/30 px-4 py-2 hover:bg-[#e8bf9b]/10 transition-colors"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                GET DIRECTIONS →
              </a>
            </div>

            {/* Google Map Embed */}
            <div className="md:col-span-8">
              <div
                className="relative w-full overflow-hidden rounded-xl border border-[#4f453d]/40"
                style={{ height: "320px" }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.19891888952!2d36.70730744179689!3d-1.3028617999999985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1718000000000!5m2!1sen!2ske"
                  width="100%"
                  height="100%"
                  style={{
                    border: 0,
                    filter: "invert(90%) hue-rotate(180deg) saturate(0.8)",
                    borderRadius: "12px",
                  }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Forge & Timber Atelier Location"
                />
                {/* Overlay badge */}
                <div className="absolute top-4 left-4 bg-[#0e0e0e]/90 border border-[#e8bf9b]/30 px-3 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#e8bf9b] rounded-full animate-pulse" />
                  <span
                    className="text-xs text-[#e8bf9b]"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    EMBAKASI · NAIROBI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid rgba(79,69,61,0.3)", background: "rgba(0,0,0,0.4)" }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-16 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#9c8e84] text-xs text-center md:text-left">
            © {new Date().getFullYear()} Forge &amp; Timber Atelier. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="text-[#9c8e84] hover:text-[#e8bf9b] text-xs transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#e8bf9b] rounded-full animate-pulse" />
            <span
              className="text-xs text-[#9c8e84]"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              HANDMADE IN KENYA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
