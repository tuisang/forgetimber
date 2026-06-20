"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

const ADMIN_USER_ID = "user_3FOCtiBnlnMNPZ1naaYqyDcUFpP";

interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  paymentMethod: string;
  status: string;
  clerkUserId: string | null;
  createdAt: string;
  attachmentUrl: string | null;
}

interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  items: { id: number; name: string; price: number; quantity: number }[];
  totalAmount: number;
  paymentMethod: string;
  status: string;
  mpesaReceiptNumber: string | null;
  createdAt: string;
}

interface Quote {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  woodSpecies: string | null;
  metalFinish: string | null;
  dimensions: string | null;
  budget: string;
  timeline: string;
  description: string;
  attachmentUrl: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

interface Review {
  id: string;
  authorName: string;
  authorEmail: string | null;
  rating: number;
  title: string;
  body: string;
  service: string | null;
  approved: boolean;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  clerkUserId: string | null;
  createdAt: string;
  messages: ChatMessage[];
}

type Tab = "overview" | "bookings" | "chats" | "reviews" | "quotes" | "orders";

const STATUS_COLORS: Record<string, string> = {
  pending: "#ffb785",
  confirmed: "#4ade80",
  completed: "#60a5fa",
  cancelled: "#f87171",
};

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user || user.id !== ADMIN_USER_ID) {
      router.push("/");
      return;
    }
    fetchAll();
  }, [isLoaded, user]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [bRes, cRes, rRes, qRes, oRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/chats"),
        fetch("/api/admin/reviews"),
        fetch("/api/admin/quotes"),
        fetch("/api/admin/orders"),
      ]);
      const bData = await bRes.json();
      const cData = await cRes.json();
      const rData = await rRes.json();
      const qData = await qRes.json();
      const oData = await oRes.json();
      setBookings(bData.bookings ?? []);
      setSessions(cData.sessions ?? []);
      setReviews(rData.reviews ?? []);
      setQuotes(qData.quotes ?? []);
      setOrders(oData.orders ?? []);
      if (cData.sessions?.length > 0) setActiveSession(cData.sessions[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleApproval = async (id: string, approved: boolean) => {
    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved }),
      });
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const totalRevenue = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "completed"
  ).length * 5000;

  const activeMessages = sessions.find((s) => s.id === activeSession)?.messages ?? [];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-KE", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  if (!isLoaded || (isLoaded && user?.id !== ADMIN_USER_ID)) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-3 h-3 bg-[#e8bf9b] rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="bg-[#0e0e0e] text-[#e5e2e1] min-h-screen">
      {/* Top Bar */}
      <div className="fixed top-0 w-full z-50 bg-[#0e0e0e] border-b border-[#4f453d]/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-[#e8bf9b] rounded-full animate-pulse" />
          <span className="font-bold text-lg" style={{ fontFamily: "Playfair Display, serif" }}>
            Forge &amp; Timber
          </span>
          <span className="text-xs text-[#9c8e84] tracking-widest px-3 py-1 border border-[#4f453d]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            ADMIN PANEL
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#9c8e84]">{user?.primaryEmailAddress?.emailAddress}</span>
          <button
            onClick={() => router.push("/")}
            className="text-xs border border-[#4f453d] px-4 py-2 hover:border-[#e8bf9b] transition-colors"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            ← SITE
          </button>
        </div>
      </div>

      <div className="pt-40 pb-24 max-w-[1440px] mx-auto px-4 md:px-16">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-[#4f453d]/40 pb-4">
          {(["overview", "bookings", "orders", "quotes", "reviews", "chats"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 text-xs tracking-widest uppercase transition-all ${
                tab === t
                  ? "bg-[#e8bf9b] text-[#442b12]"
                  : "border border-[#4f453d] text-[#d3c4b9] hover:border-[#e8bf9b]"
              }`}
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {t}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-3 h-3 bg-[#e8bf9b] rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {!isLoading && tab === "overview" && (
          <div className="space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "TOTAL BOOKINGS", value: bookings.length, icon: "calendar_month" },
                { label: "CONFIRMED", value: bookings.filter((b) => b.status === "confirmed").length, icon: "check_circle" },
                { label: "PENDING", value: bookings.filter((b) => b.status === "pending").length, icon: "pending" },
                { label: "REVENUE (KES)", value: totalRevenue.toLocaleString(), icon: "payments" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#131313] border border-[#4f453d]/40 p-6">
                  <span className="material-symbols-outlined text-[#e8bf9b] text-2xl mb-3 block">{stat.icon}</span>
                  <p className="text-3xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif" }}>{stat.value}</p>
                  <p className="text-xs text-[#9c8e84] tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "CHAT SESSIONS", value: sessions.length, icon: "chat_bubble" },
                { label: "TOTAL MESSAGES", value: sessions.reduce((acc, s) => acc + s.messages.length, 0), icon: "forum" },
                { label: "UNIQUE USERS", value: new Set(sessions.map((s) => s.clerkUserId).filter(Boolean)).size, icon: "group" },
                { label: "REVIEWS", value: reviews.length, icon: "star" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#131313] border border-[#4f453d]/40 p-6">
                  <span className="material-symbols-outlined text-[#e8bf9b] text-2xl mb-3 block">{stat.icon}</span>
                  <p className="text-3xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif" }}>{stat.value}</p>
                  <p className="text-xs text-[#9c8e84] tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#131313] border border-[#4f453d]/40">
              <div className="p-6 border-b border-[#4f453d]/40 flex justify-between items-center">
                <h2 className="text-xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>Recent Bookings</h2>
                <button onClick={() => setTab("bookings")} className="text-xs text-[#e8bf9b] hover:underline" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  VIEW ALL →
                </button>
              </div>
              <div className="divide-y divide-[#4f453d]/30">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{b.name}</p>
                      <p className="text-xs text-[#9c8e84]">{b.service} · {b.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs px-3 py-1 border" style={{ borderColor: STATUS_COLORS[b.status], color: STATUS_COLORS[b.status], fontFamily: "JetBrains Mono, monospace" }}>
                        {b.status.toUpperCase()}
                      </span>
                      <span className="text-sm font-bold text-[#e8bf9b]">KES 5,000</span>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <p className="p-8 text-center text-[#9c8e84] text-sm">No bookings yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {!isLoading && tab === "bookings" && (
          <div className="bg-[#131313] border border-[#4f453d]/40">
            <div className="p-6 border-b border-[#4f453d]/40">
              <h2 className="text-xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>
                All Bookings ({bookings.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#4f453d]/40">
                    {["Client", "Service", "Date", "Payment", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left p-4 text-xs text-[#9c8e84] tracking-widest font-medium" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4f453d]/20">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#20201f] transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-sm">{b.name}</p>
                        <p className="text-xs text-[#9c8e84]">{b.email}</p>
                        <p className="text-xs text-[#9c8e84]">{b.phone}</p>
                      </td>
                      <td className="p-4 text-sm capitalize">{b.service}</td>
                      <td className="p-4 text-xs text-[#d3c4b9]">{b.date}</td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 bg-[#20201f] border border-[#4f453d] capitalize" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-3 py-1 border" style={{ borderColor: STATUS_COLORS[b.status], color: STATUS_COLORS[b.status], fontFamily: "JetBrains Mono, monospace" }}>
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={b.status}
                          onChange={(e) => updateStatus(b.id, e.target.value)}
                          disabled={updatingId === b.id}
                          className="bg-[#20201f] border border-[#4f453d] text-xs px-3 py-2 text-[#e5e2e1] outline-none hover:border-[#e8bf9b] transition-colors cursor-pointer"
                          style={{ fontFamily: "JetBrains Mono, monospace" }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-[#9c8e84]">No bookings yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {!isLoading && tab === "orders" && (
          <div className="bg-[#131313] border border-[#4f453d]/40">
            <div className="p-6 border-b border-[#4f453d]/40">
              <h2 className="text-xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>
                Shop Orders ({orders.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#4f453d]/40">
                    {["Client", "Items", "Total", "Payment", "M-Pesa Receipt", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left p-4 text-xs text-[#9c8e84] tracking-widest font-medium" style={{ fontFamily: "JetBrains Mono, monospace" }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4f453d]/20">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#20201f] transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-sm">{o.name}</p>
                        <p className="text-xs text-[#9c8e84]">{o.email}</p>
                        <p className="text-xs text-[#9c8e84]">{o.phone}</p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {Array.isArray(o.items) && o.items.map((item, i) => (
                            <p key={i} className="text-xs text-[#d3c4b9]">{item.name} × {item.quantity}</p>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-[#e8bf9b]">KSh {o.totalAmount.toLocaleString()}</td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 bg-[#20201f] border border-[#4f453d] capitalize" style={{ fontFamily: "JetBrains Mono, monospace" }}>{o.paymentMethod}</span>
                      </td>
                      <td className="p-4 text-xs text-[#9c8e84]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                        {o.mpesaReceiptNumber ?? "—"}
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-3 py-1 border" style={{
                          borderColor: o.status === "paid" ? "#4ade80" : o.status === "awaiting_payment" ? "#facc15" : o.status === "pending" ? "#ffb785" : "#f87171",
                          color: o.status === "paid" ? "#4ade80" : o.status === "awaiting_payment" ? "#facc15" : o.status === "pending" ? "#ffb785" : "#f87171",
                          fontFamily: "JetBrains Mono, monospace",
                        }}>
                          {o.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={o.status}
                          onChange={async (e) => {
                            const status = e.target.value;
                            await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: o.id, status }) });
                            setOrders((prev) => prev.map((ord) => ord.id === o.id ? { ...ord, status } : ord));
                          }}
                          className="bg-[#20201f] border border-[#4f453d] text-xs px-3 py-2 text-[#e5e2e1] outline-none hover:border-[#e8bf9b] transition-colors"
                          style={{ fontFamily: "JetBrains Mono, monospace" }}
                        >
                          <option value="pending">Pending</option>
                          <option value="awaiting_payment">Awaiting Payment</option>
                          <option value="paid">Paid</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={7} className="p-12 text-center text-[#9c8e84]">No orders yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* QUOTES TAB */}
        {!isLoading && tab === "quotes" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-[#131313] border border-[#4f453d]/40 overflow-hidden">
              <div className="p-5 border-b border-[#4f453d]/40">
                <p className="text-xs tracking-widest text-[#9c8e84]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {quotes.length} QUOTE REQUESTS
                </p>
              </div>
              <div className="divide-y divide-[#4f453d]/20 overflow-y-auto max-h-[700px]">
                {quotes.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuote(q)}
                    className={`w-full text-left p-5 hover:bg-[#20201f] transition-colors ${activeQuote?.id === q.id ? "bg-[#20201f] border-l-2 border-l-[#e8bf9b]" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm">{q.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 border ${
                        q.status === "new" ? "border-[#ffb785] text-[#ffb785]" :
                        q.status === "reviewing" ? "border-[#60a5fa] text-[#60a5fa]" :
                        q.status === "quoted" ? "border-[#4ade80] text-[#4ade80]" :
                        "border-[#4f453d] text-[#9c8e84]"
                      }`} style={{ fontFamily: "JetBrains Mono, monospace" }}>
                        {q.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[#e8bf9b] mb-1">{q.service}</p>
                    <p className="text-xs text-[#9c8e84] truncate">{q.budget} · {q.timeline}</p>
                  </button>
                ))}
                {quotes.length === 0 && <p className="p-8 text-center text-[#9c8e84] text-sm">No quote requests yet.</p>}
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#131313] border border-[#4f453d]/40">
              {activeQuote ? (
                <div className="p-6 overflow-y-auto max-h-[750px]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>{activeQuote.name}</h2>
                      <p className="text-sm text-[#9c8e84]">{activeQuote.email} · {activeQuote.phone}</p>
                    </div>
                    <select
                      value={activeQuote.status}
                      onChange={async (e) => {
                        const status = e.target.value;
                        await fetch("/api/admin/quotes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: activeQuote.id, status }) });
                        setQuotes((prev) => prev.map((q) => q.id === activeQuote.id ? { ...q, status } : q));
                        setActiveQuote((prev) => prev ? { ...prev, status } : null);
                      }}
                      className="bg-[#20201f] border border-[#4f453d] text-xs px-3 py-2 text-[#e5e2e1] outline-none hover:border-[#e8bf9b] transition-colors"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="quoted">Quoted</option>
                      <option value="accepted">Accepted</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      ["Service", activeQuote.service],
                      ["Budget", activeQuote.budget],
                      ["Timeline", activeQuote.timeline],
                      ["Dimensions", activeQuote.dimensions ?? "—"],
                      ["Wood Species", activeQuote.woodSpecies ?? "—"],
                      ["Metal Finish", activeQuote.metalFinish ?? "—"],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-[#20201f] p-3 border border-[#4f453d]/30">
                        <p className="text-[10px] text-[#9c8e84] tracking-widest mb-1" style={{ fontFamily: "JetBrains Mono, monospace" }}>{label}</p>
                        <p className="text-sm font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mb-6">
                    <p className="text-xs text-[#9c8e84] tracking-widest mb-2" style={{ fontFamily: "JetBrains Mono, monospace" }}>PROJECT DESCRIPTION</p>
                    <p className="text-sm text-[#d3c4b9] leading-relaxed bg-[#20201f] p-4 border border-[#4f453d]/30">{activeQuote.description}</p>
                  </div>
                  {activeQuote.attachmentUrl && (
                    <a href={activeQuote.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#e8bf9b] hover:underline mb-6">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      View Attachment
                    </a>
                  )}
                  <div>
                    <p className="text-xs text-[#9c8e84] tracking-widest mb-2" style={{ fontFamily: "JetBrains Mono, monospace" }}>ADMIN NOTES</p>
                    <textarea
                      rows={3}
                      placeholder="Add internal notes, quote amount, follow-up actions..."
                      defaultValue={activeQuote.adminNotes ?? ""}
                      onBlur={async (e) => {
                        await fetch("/api/admin/quotes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: activeQuote.id, adminNotes: e.target.value }) });
                      }}
                      className="w-full bg-[#20201f] border border-[#4f453d] focus:border-[#e8bf9b] p-3 text-sm text-[#e5e2e1] placeholder-[#9c8e84] outline-none transition-colors resize-none"
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <a
                      href={`mailto:${activeQuote.email}?subject=Your Quote Request - Forge %26 Timber Atelier&body=Hello ${activeQuote.name},%0A%0AThank you for your quote request for ${activeQuote.service}.%0A%0A`}
                      className="flex-1 text-center py-3 bg-[#e8bf9b] text-[#442b12] text-xs font-semibold hover:brightness-110 transition-all"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      REPLY VIA EMAIL
                    </a>
                    <a
                      href={`https://wa.me/${activeQuote.phone.replace(/[^0-9]/g, "")}?text=Hello ${activeQuote.name}, thank you for your quote request for ${activeQuote.service} at Forge %26 Timber Atelier.`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-center py-3 bg-[#25D366] text-white text-xs font-semibold hover:brightness-110 transition-all"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      REPLY VIA WHATSAPP
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-12 text-center">
                  <div>
                    <svg className="mx-auto mb-4 text-[#4f453d]" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    <p className="text-[#9c8e84] text-sm">Select a quote request to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {!isLoading && tab === "reviews" && (
          <div className="bg-[#131313] border border-[#4f453d]/40">
            <div className="p-6 border-b border-[#4f453d]/40 flex justify-between items-center">
              <h2 className="text-xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>
                All Reviews ({reviews.length})
              </h2>
              <div className="flex gap-4 text-xs" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                <span className="text-[#4ade80]">{reviews.filter((r) => r.approved).length} APPROVED</span>
                <span className="text-[#ffb785]">{reviews.filter((r) => !r.approved).length} PENDING</span>
              </div>
            </div>
            <div className="divide-y divide-[#4f453d]/20">
              {reviews.map((r) => (
                <div key={r.id} className="p-6 hover:bg-[#20201f] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= r.rating ? "#e8bf9b" : "none"} stroke="#e8bf9b" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                        <span className={`text-xs px-2 py-0.5 border ${r.approved ? "border-[#4ade80] text-[#4ade80]" : "border-[#ffb785] text-[#ffb785]"}`} style={{ fontFamily: "JetBrains Mono, monospace" }}>
                          {r.approved ? "APPROVED" : "PENDING"}
                        </span>
                        {r.service && <span className="text-xs text-[#9c8e84] capitalize">{r.service}</span>}
                      </div>
                      <h3 className="font-semibold mb-1" style={{ fontFamily: "Playfair Display, serif" }}>{r.title}</h3>
                      <p className="text-sm text-[#d3c4b9] mb-2">{r.body}</p>
                      <p className="text-xs text-[#9c8e84]">
                        {r.authorName} {r.authorEmail && `· ${r.authorEmail}`} · {formatDate(r.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleApproval(r.id, !r.approved)}
                        className={`text-xs px-4 py-2 border transition-colors ${r.approved ? "border-[#f87171] text-[#f87171] hover:bg-[#f87171]/10" : "border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80]/10"}`}
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {r.approved ? "UNAPPROVE" : "APPROVE"}
                      </button>
                      <button
                        onClick={() => deleteReview(r.id)}
                        className="text-xs px-4 py-2 border border-[#4f453d] text-[#9c8e84] hover:border-[#f87171] hover:text-[#f87171] transition-colors"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && <p className="p-12 text-center text-[#9c8e84]">No reviews yet.</p>}
            </div>
          </div>
        )}

        {/* CHATS TAB */}
        {!isLoading && tab === "chats" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
            <div className="lg:col-span-4 bg-[#131313] border border-[#4f453d]/40 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-[#4f453d]/40">
                <p className="text-xs tracking-widest text-[#9c8e84]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {sessions.length} SESSIONS
                </p>
              </div>
              <div className="overflow-y-auto flex-1">
                {sessions.map((session, i) => (
                  <button
                    key={session.id}
                    onClick={() => setActiveSession(session.id)}
                    className={`w-full text-left p-5 border-b border-[#4f453d]/30 transition-all hover:bg-[#20201f] ${activeSession === session.id ? "bg-[#20201f] border-l-2 border-l-[#e8bf9b]" : ""}`}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#e8bf9b]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                        SESSION {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] text-[#9c8e84]">{session.messages.length} msgs</span>
                    </div>
                    <p className="text-xs text-[#9c8e84] truncate mb-1">{session.clerkUserId ?? "Anonymous"}</p>
                    <p className="text-[10px] text-[#4f453d]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {formatDate(session.createdAt)}
                    </p>
                  </button>
                ))}
                {sessions.length === 0 && <p className="p-8 text-center text-[#9c8e84] text-sm">No chat sessions yet.</p>}
              </div>
            </div>

            <div className="lg:col-span-8 bg-[#131313] border border-[#4f453d]/40 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-[#4f453d]/40">
                <p className="text-sm font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>Conversation View</p>
                <p className="text-xs text-[#9c8e84]">{activeMessages.length} messages</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {activeMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[75%] px-4 py-3 text-sm leading-relaxed"
                      style={
                        msg.role === "user"
                          ? { background: "#e8bf9b", color: "#2c1602", fontWeight: 500 }
                          : { background: "#20201f", color: "#e5e2e1", border: "1px solid rgba(79,69,61,0.5)", borderLeftColor: "#e8bf9b", borderLeftWidth: 3 }
                      }
                    >
                      <p className="text-[10px] mb-1 opacity-60" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                        {msg.role.toUpperCase()} · {formatDate(msg.createdAt)}
                      </p>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {activeMessages.length === 0 && (
                  <p className="text-center text-[#9c8e84] text-sm mt-12">Select a session to view messages.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
