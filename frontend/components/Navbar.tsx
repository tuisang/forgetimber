"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import CartDrawer from "@/components/CartDrawer";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Journal" },
  { href: "/catalog", label: "Materials" },
  { href: "/quote", label: "Get a Quote" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "Dashboard" },
];

  const searchPages = [
    { label: "Homepage", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Journal", href: "/blog" },
    { label: "Material Catalog", href: "/catalog" },
    { label: "Book Consultation", href: "/booking" },
    { label: "Reviews", href: "/reviews" },
    { label: "My Dashboard", href: "/dashboard" },
    { label: "Chat History", href: "/chat-history" },
    { label: "Contact Us", href: "/contact" },
  ];

  const filtered = searchQuery.length > 1
    ? searchPages.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchSelect = (href: string) => {
    router.push(href);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const Logo = () => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer hexagon - steel plate */}
      <polygon points="18,2 32,10 32,26 18,34 4,26 4,10" fill="#20201f" stroke="#e8bf9b" strokeWidth="1.5"/>
      {/* Wood grain lines */}
      <line x1="10" y1="13" x2="26" y2="13" stroke="#4f453d" strokeWidth="1" strokeLinecap="round"/>
      <line x1="8" y1="17" x2="28" y2="17" stroke="#4f453d" strokeWidth="1" strokeLinecap="round"/>
      <line x1="10" y1="21" x2="26" y2="21" stroke="#4f453d" strokeWidth="1" strokeLinecap="round"/>
      {/* Steel rivet / center mark */}
      <circle cx="18" cy="17" r="4" fill="none" stroke="#e8bf9b" strokeWidth="1.5"/>
      <circle cx="18" cy="17" r="1.5" fill="#e8bf9b"/>
      {/* Corner rivets */}
      <circle cx="10" cy="10" r="1.2" fill="#e8bf9b" opacity="0.6"/>
      <circle cx="26" cy="10" r="1.2" fill="#e8bf9b" opacity="0.6"/>
      <circle cx="10" cy="24" r="1.2" fill="#e8bf9b" opacity="0.6"/>
      <circle cx="26" cy="24" r="1.2" fill="#e8bf9b" opacity="0.6"/>
    </svg>
  );

  const CartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );

  const HeartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
    </svg>
  );

  const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );

  return (
    <>
      <style>{`
        @keyframes search-slide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .search-dropdown { animation: search-slide 0.2s ease forwards; }
      `}</style>

      <nav className="fixed top-0 w-full z-50 border-b border-[#4f453d]/30"
        style={{ background: "rgba(19,19,19,0.92)", backdropFilter: "blur(20px)" }}>
        <div className="flex justify-between items-center px-6 md:px-12 py-4 w-full max-w-[1440px] mx-auto">

          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <Logo />
            <div>
              <span
                className="font-bold tracking-tighter text-[#e5e2e1] text-2xl md:text-3xl block leading-none group-hover:text-[#e8bf9b] transition-colors"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Forge &amp; Timber
              </span>
              <span
                className="text-[9px] text-[#9c8e84] tracking-[0.2em] leading-none"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                ATELIER · NAIROBI
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex gap-6 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                  pathname === link.href
                    ? "text-[#e8bf9b] font-bold border-b-2 border-[#e8bf9b] pb-1"
                    : "text-[#d3c4b9] hover:text-[#e8bf9b]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-[#d3c4b9] hover:text-[#e8bf9b] transition-colors p-1"
              >
                <SearchIcon />
              </button>
              {searchOpen && (
                <div className="search-dropdown absolute right-0 top-10 w-72 bg-[#0e0e0e] border border-[#4f453d] z-50">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#4f453d]/40">
                    <SearchIcon />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search pages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
                        if (e.key === "Enter" && filtered.length > 0) handleSearchSelect(filtered[0].href);
                      }}
                      className="bg-transparent outline-none text-sm text-[#e5e2e1] placeholder-[#9c8e84] flex-1"
                    />
                    <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-[#9c8e84] hover:text-[#e8bf9b] text-lg">✕</button>
                  </div>
                  {filtered.length > 0 && (
                    <div>
                      {filtered.map((p) => (
                        <button
                          key={p.href}
                          onClick={() => handleSearchSelect(p.href)}
                          className="w-full text-left px-4 py-3 text-sm text-[#d3c4b9] hover:bg-[#20201f] hover:text-[#e8bf9b] flex items-center gap-3 transition-colors border-b border-[#4f453d]/20"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e8bf9b" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {searchQuery.length > 1 && filtered.length === 0 && (
                    <p className="px-4 py-3 text-sm text-[#9c8e84]">No results found.</p>
                  )}
                  {searchQuery.length <= 1 && (
                    <div className="p-3">
                      {searchPages.map((p) => (
                        <button
                          key={p.href}
                          onClick={() => handleSearchSelect(p.href)}
                          className="w-full text-left px-3 py-2 text-xs text-[#9c8e84] hover:text-[#e8bf9b] hover:bg-[#20201f] transition-colors"
                          style={{ fontFamily: "JetBrains Mono, monospace" }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/wishlist"
              className="relative text-[#d3c4b9] hover:text-[#e8bf9b] transition-colors"
            >
              <HeartIcon />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-[#e8bf9b] text-[#442b12] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative text-[#d3c4b9] hover:text-[#e8bf9b] transition-colors"
            >
              <CartIcon />
              {totalItems > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-[#e8bf9b] text-[#442b12] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            <Link
              href="/booking"
              className="bg-[#e8bf9b] text-[#442b12] text-sm font-semibold px-6 py-2.5 hover:bg-[#e8bf9b]/90 transition-all active:scale-95 whitespace-nowrap"
            >
              Book Consultation
            </Link>

            <SignedOut>
              <SignInButton>
                <button className="text-[#d3c4b9] hover:text-[#e8bf9b] text-sm font-medium transition-colors whitespace-nowrap">
                  Login
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile Right */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[#d3c4b9] hover:text-[#e8bf9b] transition-colors"
            >
              <SearchIcon />
            </button>
            <Link
              href="/wishlist"
              className="relative text-[#d3c4b9] hover:text-[#e8bf9b] transition-colors"
            >
              <HeartIcon />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#e8bf9b] text-[#442b12] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-[#d3c4b9] hover:text-[#e8bf9b] transition-colors"
            >
              <CartIcon />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#e8bf9b] text-[#442b12] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
            <SignedIn><UserButton /></SignedIn>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col justify-center items-center w-8 h-8 gap-[5px] focus:outline-none"
            >
              <span className="block w-5 h-[2px] bg-[#e8bf9b] transition-all duration-300" style={{ transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
              <span className="block w-5 h-[2px] bg-[#e8bf9b] transition-all duration-300" style={{ opacity: menuOpen ? 0 : 1 }} />
              <span className="block w-5 h-[2px] bg-[#e8bf9b] transition-all duration-300" style={{ transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="lg:hidden px-4 pb-4 relative">
            <div className="flex items-center gap-3 bg-[#20201f] border border-[#4f453d] px-4 py-3">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered.length > 0) handleSearchSelect(filtered[0].href);
                }}
                className="bg-transparent outline-none text-sm text-[#e5e2e1] placeholder-[#9c8e84] flex-1"
                autoFocus
              />
            </div>
            {filtered.length > 0 && (
              <div className="bg-[#0e0e0e] border border-[#4f453d] border-t-0">
                {filtered.map((p) => (
                  <button
                    key={p.href}
                    onClick={() => handleSearchSelect(p.href)}
                    className="w-full text-left px-4 py-3 text-sm text-[#d3c4b9] hover:bg-[#20201f] hover:text-[#e8bf9b] flex items-center gap-3 border-b border-[#4f453d]/20"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e8bf9b" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-[#131313]/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-[80%] max-w-[320px] z-50 lg:hidden flex flex-col border-l border-[#4f453d]/40"
        style={{
          background: "rgba(14,14,14,0.98)",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#4f453d]/40">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <polygon points="18,2 32,10 32,26 18,34 4,26 4,10" fill="#20201f" stroke="#e8bf9b" strokeWidth="1.5"/>
              <circle cx="18" cy="17" r="4" fill="none" stroke="#e8bf9b" strokeWidth="1.5"/>
              <circle cx="18" cy="17" r="1.5" fill="#e8bf9b"/>
            </svg>
            <span className="text-[#e8bf9b] font-bold text-lg" style={{ fontFamily: "Playfair Display, serif" }}>Forge &amp; Timber</span>
          </div>
          <button onClick={() => setMenuOpen(false)} className="text-[#9c8e84] hover:text-[#e8bf9b] transition-colors text-xl">✕</button>
        </div>

        <div className="flex flex-col px-6 py-8 gap-1 flex-1">
          {[...links, { href: "/chat-history", label: "My Chats" }].map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`py-4 text-lg font-medium border-b border-[#4f453d]/20 transition-colors ${
                pathname === link.href ? "text-[#e8bf9b]" : "text-[#d3c4b9] hover:text-[#e8bf9b]"
              }`}
              style={{ transitionDelay: menuOpen ? `${i * 40}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="px-6 py-8 border-t border-[#4f453d]/40 flex flex-col gap-4">
          <Link href="/booking" className="w-full bg-[#e8bf9b] text-[#442b12] text-sm font-semibold px-6 py-4 text-center hover:brightness-110 transition-all" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            BOOK CONSULTATION
          </Link>
          <SignedOut>
            <SignInButton>
              <button className="w-full border border-[#4f453d] text-[#d3c4b9] text-sm font-medium py-4 hover:border-[#e8bf9b] hover:text-[#e8bf9b] transition-colors">Login</button>
            </SignInButton>
          </SignedOut>
          <p className="text-center text-xs text-[#4f453d] tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>HANDMADE IN KENYA</p>
        </div>
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
