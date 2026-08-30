"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import ProductModal from "@/components/ProductModal";
import { CartItem } from "@/lib/CartContext";
import WishlistButton from "@/components/WishlistButton";
import Footer from "@/components/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  service?: string;
}

const HERO_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDKZkFB7nfJk6r7jmyQO-AVHnZdP7LJr29ZqN0oN7deW8u-FynV8eH49R4bubmO2QUoz08l5GAEmy704ZORM-htSo6QE8m1XQrNzsO9QWzsBJmHRZ7Y2DBUDqj62PuAbh-lASPFQ57rHdGz29cx9ckkpH4Zq2YmYd9he093plIplw7Okh7gZhohycXc2UdEF5He9qps9SX4cRwWOcjzKRvPvhskTw1ZJOvhJ2O_TXcdFP9WV_YbCCsPzmlJZwtHvC6fiB2l2pwLqsMT",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAnmUYJCVlqTL6AzkLeoD2LZTKYMnb4sfrexaOe0jvPWD6spR9lo-9UJsGepINOs6Gl8uR_YZ15OhODmHgV2dBAM3GJ08ZUCmZF7KzJCdWBCpEsw9ORWdA2oL0xaXDReS9NqXqTcydmKLX104BAc_yd-uiNyLMJLqzK4iVZi42S-7iiy4Q90RjtqvQJ1wS-cR5Lv8Nv2Q4fFS8w-DxkFWFWN4aBoma9892xEdDuguRpSR5txWWie0FSOyNOqjauM4YMZkLdwIIRuxFG",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAsSq8Nra0r65CDQA_qJi7jyKDhmXniyz0h83suHoWU8t8pxgawS7bC8GAcxqHCTICoby3FB0vF4pfywk_nh4cYsvmgdhl1iHpZnUVbG14vRCVm0qAAEDikuMGETWn9ppi0lqXAh1ghiGmcz4lOU5Asx5NwFn0EDqR72eKOTTiDDQ1ikEOCCpjD8LGrH01SrNZ5FwIPlrHjlCwkk1a3yA3YBWCRyTaLAbgbCXf2cOhntzvxx02CQy9ONbEslKyuHp6LIwMMxjWxk9do",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCi0W20K7JdvjhzPhBCsufmbaCx6pdfVSw5SrxgrjXUKLHdiJV1rROV8o8_LKu53mozE401KnCURBw11DWNKdpKPHa0ibFoeGGLzOxpKn3p_Uy1hGqt0MpJ627Qet6f84qC9j_56U52neJQVm47khZxpwk3q_8k5nHvVV65ZKkuMiXOc3WCzvztYLUnDWoafbQ_sQr9gv0TTaPMnqfFtWxan8a0t_id8OOQf1rb0Wxl9U9GlU10hIq1zgaXyXv3I4haAXKje6wpvGEY",
];

const TOOLS = [
  { id: 1, name: "Bender", image: "/tools/bender.jpg", price: 24500, reviews: 128 },
  { id: 2, name: "Clamp", image: "/tools/clamp.jpg", price: 18900, reviews: 96 },
  { id: 3, name: "Drill", image: "/tools/drill.webp", price: 12500, reviews: 75 },
  { id: 4, name: "CNC", image: "/tools/cnc.webp", price: 9500, reviews: 62 },
  { id: 5, name: "Cutter", image: "/tools/cutter.jpg", price: 4200, reviews: 44 },
  { id: 6, name: "Files", image: "/tools/files.jpg", price: 32000, reviews: 31 },
  { id: 7, name: "Grip", image: "/tools/grip.jpg", price: 6500, reviews: 18 },
  { id: 8, name: "Spinner", image: "/tools/spinner.jpg", price: 11500, reviews: 50 },
  { id: 9, name: "Vice", image: "/tools/vice.jpg", price: 2800, reviews: 39 },
  { id: 10, name: "Woodwaf", image: "/tools/woodwaf.jpg", price: 17500, reviews: 85 },
];

const USD_KES_RATE = 130; // approximate, update periodically

export default function HomePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Omit<CartItem, "quantity"> | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const { addToCart } = useCart();

  const updateQuantity = (id: number, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + change),
    }));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setReviews((d.reviews ?? []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <main className="text-[#e5e2e1] overflow-x-hidden" style={{ position: "relative" }}>

      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[100] opacity-[0.05]"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#131313] via-[#131313]/60 to-transparent z-10" />
          {HERO_IMAGES.map((img, i) => (
            <div key={i} style={{ position: "absolute", inset: 0, opacity: i === heroIndex ? 1 : 0, transition: "opacity 1.5s ease-in-out", zIndex: i === heroIndex ? 2 : 1 }}>
              <img style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)", opacity: 0.45 }} src={img} alt={`Hero ${i + 1}`} />
            </div>
          ))}
          <div style={{ position: "absolute", bottom: "32px", right: "32px", zIndex: 20, display: "flex", gap: "8px" }}>
            {HERO_IMAGES.map((_, i) => (
              <button key={i} onClick={() => setHeroIndex(i)} style={{ width: i === heroIndex ? "28px" : "8px", height: "8px", background: i === heroIndex ? "#e8bf9b" : "rgba(232,191,155,0.35)", border: "none", cursor: "pointer", transition: "all 0.4s ease", padding: 0 }} />
            ))}
          </div>
        </div>
        <div className="relative z-20 px-4 md:px-16 max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 flex flex-col justify-center py-20">
            <span className="text-xs font-medium tracking-[0.2em] text-[#ffb785] mb-4" style={{ fontFamily: "JetBrains Mono, monospace" }}>CRAFTED IN NAIROBI</span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl mb-6" style={{ fontFamily: "Playfair Display, serif", letterSpacing: "-0.02em" }}>
              Where <span className="italic text-[#e8bf9b]">Timber</span> Meets{" "}
              <span className="text-[#c3c7cb]">Steel</span> in Timeless African Craftsmanship.
            </h1>
            <p className="text-lg text-[#d3c4b9] mb-10 max-w-xl leading-relaxed">
              Bespoke furniture engineered for the modern home. We bridge the gap between organic African timber and industrial-grade steel fabrication.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/portfolio" className="bg-[#e8bf9b] text-[#442b12] px-10 py-4 text-sm font-semibold hover:bg-[#e8bf9b]/90 transition-all flex items-center gap-2 group">
                Explore Creations
                <svg className="group-hover:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/booking" className="border border-[#9c8e84] px-10 py-4 text-sm font-semibold hover:bg-[#353535] transition-all">Book Consultation</Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Artisan Section */}
      <section className="py-24 px-4 md:px-16 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 mb-12 md:mb-0">
            <div className="relative p-1 bg-gradient-to-br from-[#e8bf9b]/30 to-transparent">
              <div className="bg-[#2a2a2a] p-8 border border-[rgba(156,142,132,0.2)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-[#ffb785] rounded-full animate-pulse" />
                  <span className="text-xs text-[#ffb785] tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>SYSTEM STATUS: ACTIVE</span>
                </div>
                <h2 className="text-3xl font-semibold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>The AI Artisan</h2>
                <p className="text-[#d3c4b9] mb-8 leading-relaxed">Our proprietary RAG-powered intelligence is trained on decades of fabrication data, timber species characteristics, and structural engineering principles.</p>
                <div className="space-y-4 mb-8">
                  {['"How do I care for oiled Mvule wood?"', '"Calculate load capacity for steel legs."'].map((q) => (
                    <div key={q} className="flex items-center gap-3 text-sm text-[#d3c4b9] italic">
                      <span className="material-symbols-outlined text-[#e8bf9b] text-lg">terminal</span>
                      {q}
                    </div>
                  ))}
                </div>
                <button className="w-full py-4 border border-[#e8bf9b]/40 text-[#e8bf9b] hover:bg-[#e8bf9b]/10 transition-colors text-sm font-semibold">Initialize Knowledge Base</button>
              </div>
            </div>
          </div>
          <div className="md:col-span-7 pl-0 md:pl-12">
            <h3 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
              Precision guided by <br /><span className="text-[#e8bf9b] italic">Intelligence</span>.
            </h3>
            <p className="text-lg text-[#d3c4b9] max-w-md leading-relaxed">From wood moisture content analysis to stress-testing metal joints, our AI ensures that every piece of furniture is a masterpiece of both art and engineering.</p>
          </div>
        </div>
      </section>

      {/* Woodworking Tools Carousel */}
      <section className="py-24 bg-[#0e0e0e]">
        <div className="px-4 md:px-16 max-w-[1440px] mx-auto mb-10">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs text-[#9c8e84] tracking-widest mb-4 block" style={{ fontFamily: "JetBrains Mono, monospace" }}>FABRICATION ESSENTIALS</span>
              <h2 className="text-3xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>Woodworking Tools</h2>
            </div>
            <Link href="/shop" className="text-xs text-[#e8bf9b] hover:underline" style={{ fontFamily: "JetBrains Mono, monospace" }}>VIEW ALL →</Link>
          </div>
        </div>
        <Swiper
          modules={[Autoplay, Navigation]}
          loop={true}
          navigation
          speed={1500}
          autoplay={{ delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          spaceBetween={20}
          slidesPerView={5}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 5 },
          }}
          className="px-4 md:px-16"
        >
          {TOOLS.map((tool) => (
            <SwiperSlide key={tool.id}>
              <div className="relative rounded-xl overflow-hidden group shadow-xl">
                <img src={tool.image} alt={tool.name} className="w-full h-[340px] object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <h3 className="text-white font-bold text-lg">{tool.name}</h3>
                </div>
                <div className="absolute top-4 right-4 flex items-start gap-2">
                  <WishlistButton item={{ id: tool.id, name: tool.name, price: tool.price, img: tool.image }} />
                  <div className="bg-[#e8bf9b] text-black px-3 py-1 rounded-full font-semibold text-sm flex flex-col items-end leading-tight">
                    <span>KSh {tool.price.toLocaleString()}</span>
                    <span className="text-[10px] font-normal opacity-70">
                      ≈ ${Math.round(tool.price / USD_KES_RATE).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm p-3 rounded-xl w-[190px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-yellow-400 text-sm">★★★★★</div>
                    <span className="text-xs text-white">({tool.reviews})</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <button onClick={() => updateQuantity(tool.id, -1)} className="bg-white text-black w-8 h-8 rounded font-bold">-</button>
                    <span className="text-white font-bold">{quantities[tool.id] || 1}</span>
                    <button onClick={() => updateQuantity(tool.id, 1)} className="bg-white text-black w-8 h-8 rounded font-bold">+</button>
                  </div>
                  <button
                    onClick={() => addToCart(
  { id: tool.id, name: tool.name, price: tool.price, priceLabel: `KSh ${tool.price.toLocaleString()}`, img: tool.image },
  quantities[tool.id] || 1
)}
                    className="bg-[#e8bf9b] text-[#442b12] px-3 py-2 rounded w-full font-semibold text-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* From the Workshop Section */}
      <section className="py-24 px-4 md:px-16 max-w-[1440px] mx-auto overflow-hidden">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-semibold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>From the Workshop</h2>
          <p className="text-[#d3c4b9] max-w-2xl mx-auto">Witness the fusion of traditional skill and modern technology through our artisan spotlight series.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "TIKTOK TRENDING", title: "Steel Framework Evolution", views: "24.5k Views", videoId: "dQw4w9WgXcQ", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnmUYJCVlqTL6AzkLeoD2LZTKYMnb4sfrexaOe0jvPWD6spR9lo-9UJsGepINOs6Gl8uR_YZ15OhODmHgV2dBAM3GJ08ZUCmZF7KzJCdWBCpEsw9ORWdA2oL0xaXDReS9NqXqTcydmKLX104BAc_yd-uiNyLMJLqzK4iVZi42S-7iiy4Q90RjtqvQJ1wS-cR5Lv8Nv2Q4fFS8w-DxkFWFWN4aBoma9892xEdDuguRpSR5txWWie0FSOyNOqjauM4YMZkLdwIIRuxFG" },
            { label: "YOUTUBE SERIES", title: "The Mvule Masterclass", views: "18.2k Views", videoId: "dQw4w9WgXcQ", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuALcwqDtHQMuozeBQ5ychH6X8MBPZ2iGrfOh5ImF0ZojiiCVwCvIUTmjhBOCdtBHbbpOzB5LshODZUAAxVuq-M5aStTO1BMHW2uxbfiqMQNWGXahaHAV9KxRgd9eejgt4D1AIcb7U1mA9Jx8JJt2Q-vDaonMYKGDq9WuSDf9sOCQhcdgzbgPxaEj-JEwXsHSLvfMrU0caQrl3bh0f8MSRSXgl-ZxWZDfxRDCSD5B8MO0yJXZBJZPGKanC0c1hTeOVXxzQezy3Ug_Qwg" },
          ].map((video) => (
            <div key={video.title} className="relative group aspect-video overflow-hidden rounded-xl cursor-pointer" onClick={() => setActiveVideo(video.videoId)}>
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={video.img} alt={video.title} />
              <div className="absolute inset-0 bg-[#131313]/40 flex items-center justify-center group-hover:bg-[#131313]/20 transition-all">
                <div className="w-20 h-20 rounded-full border-2 border-white/80 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform bg-[#131313]/30">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-[#ffb785]" style={{ fontFamily: "JetBrains Mono, monospace" }}>{video.label}</span>
                  <h4 className="text-xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>{video.title}</h4>
                </div>
                <div className="flex items-center gap-2 text-sm text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {video.views}
                </div>
              </div>
            </div>
          ))}
        </div>
        {activeVideo && (
          <div className="fixed inset-0 bg-[#131313]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setActiveVideo(null)}>
            <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setActiveVideo(null)} className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm">
                <span>Close</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                <iframe className="absolute inset-0 w-full h-full rounded-xl" src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`} title="Forge & Timber Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Marketplace Section */}
      <section className="py-24 bg-[#1c1b1b]">
        <div className="px-4 md:px-16 max-w-[1440px] mx-auto">
          <div className="flex flex-col items-start mb-16">
            <span className="text-xs text-[#e8bf9b] mb-4 tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>SIGNATURE PIECES</span>
            <h2 className="text-3xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>The Marketplace</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
            <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-[#20201f] rounded-xl">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsSq8Nra0r65CDQA_qJi7jyKDhmXniyz0h83suHoWU8t8pxgawS7bC8GAcxqHCTICoby3FB0vF4pfywk_nh4cYsvmgdhl1iHpZnUVbG14vRCVm0qAAEDikuMGETWn9ppi0lqXAh1ghiGmcz4lOU5Asx5NwFn0EDqR72eKOTTiDDQ1ikEOCCpjD8LGrH01SrNZ5FwIPlrHjlCwkk1a3yA3YBWCRyTaLAbgbCXf2cOhntzvxx02CQy9ONbEslKyuHp6LIwMMxjWxk9do" alt="The Serengeti Table" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-8 left-8 p-6 backdrop-blur-md bg-[#131313]/40 border border-white/10 w-[80%]">
                <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>The Serengeti Table</h3>
                <p className="text-sm text-[#d3c4b9] mb-4">Solid live-edge Mahogany &amp; Gunmetal Steel.</p>
                <button className="text-[#e8bf9b] font-semibold hover:translate-x-2 transition-transform flex items-center gap-2 text-sm">
                  View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
            {[
              { title: "Atelier Lounge Chair", price: 42000, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwS7wlO36JLC7GUM3S9uGNXLpR0jjPAsosoMvYf7gPDwAVP7uj-ls9JSQ4qXkjDWkWhLpDXWSXuLlPaGthnASB9ULvK1bsfDYLmE29HPqVyyrZo6593sQv6UmB4I1NQcHJVa9g9mjNiqnSAJlrxHIZygzWzR7XeKsAuNPVd95L1s8BhpPFye_CGZbgvcLpeEbEpftm20AcfFA_M0HNq6frUv5-SwqFB5ychmZaQDlS0NMFI_XFpMFvwUZt7spk897a91_T6G8-B6uM", span: "md:col-span-2" },
              { title: "Delta Side Table", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0Cc7JfnFfjZqm5GjaH81TolRX8tGrZ5TksDMXhHwVy6xPiFymwYCt4on_B8bUYyt_Es4h_maQ_03GafmiIBcbn0L56h3SxjsAUay1GiyERr1Hp4tpGdDH3zGR2YH6FYL5BTWrsZY7rj3XcLPtXDN6Us43UnMDvjvuJRJQjnn7_By-MKACx_yBk9r8QDggFsLyku9WcytmMRlVVTUnLgzYSVS4OYw-0b5WsSpVQexCc1tav0D65SsFg05x-yvok48OG0IA5qtaRSp9", span: "md:col-span-1" },
              { title: "Linear Floating Shelf", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDm8WP6lTxuBqt2ErtfPXYxPmG4LQI6E6sgCw4VM5JjbLsNoYPUMPARpEp_Fr-IF0LgxgN-3-P4EfwgxV_QKSCPQoLtObBNAclJNEVnXPTM9U4gl_kwdXaLftQqIfSfOlAqV7cEydwBXgLTvNLX7HRjDytA8sYvxrHG3xGQVsbT94ZIzgpkzydx6dPvo89ce7Y4tTgSoJRBjWT4cFCYrVzDuTv08QiBXefXN8ZxCIJ5qlkK0FX2-3IdyaGRdQDD0D52R8uwiSqJt5wG", span: "md:col-span-1" },
            ].map((item) => (
              <div key={item.title} className={`${item.span} relative group overflow-hidden bg-[#20201f]`}>
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src={item.img} alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-bold text-lg" style={{ fontFamily: "Playfair Display, serif" }}>{item.title}</h3>
                  {item.price && (
                    <div className="flex flex-col">
                      <span className="text-[#e8bf9b] text-sm font-bold">
                        KSh {item.price.toLocaleString()}
                      </span>
                      <span className="text-[#9c8e84] text-xs">
                        ≈ ${Math.round(item.price / USD_KES_RATE).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-24 bg-[#0e0e0e]">
          <div className="px-4 md:px-16 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-6">
              <div>
                <span className="text-xs text-[#ffb785] mb-4 block tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>CLIENT TESTIMONIALS</span>
                <h2 className="text-3xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>What Our Clients Say</h2>
              </div>
              <Link href="/reviews" className="text-sm text-[#e8bf9b] hover:underline flex items-center gap-2" style={{ fontFamily: "JetBrains Mono, monospace" }}>VIEW ALL REVIEWS →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-[#131313] border border-[#4f453d]/40 p-6 hover:border-[#e8bf9b]/30 transition-colors">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= review.rating ? "#e8bf9b" : "none"} stroke="#e8bf9b" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <h3 className="font-semibold mb-3" style={{ fontFamily: "Playfair Display, serif" }}>{review.title}</h3>
                  <p className="text-sm text-[#d3c4b9] leading-relaxed mb-6">&ldquo;{review.body}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#4f453d]/30">
                    <div className="w-8 h-8 bg-[#e8bf9b]/20 border border-[#e8bf9b]/30 flex items-center justify-center">
                      <span className="text-[#e8bf9b] text-sm font-bold">{review.authorName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{review.authorName}</p>
                      {review.service && <p className="text-xs text-[#9c8e84] capitalize">{review.service}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </main>
  );
}
