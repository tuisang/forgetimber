"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What wood species do you use?",
  "How long does a custom order take?",
  "Do you offer M-Pesa payment?",
  "What is your pricing range?",
];

export default function ArtisanChatbot() {
  const { isSignedIn, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (!isSignedIn) return; // guard: never fetch if not signed in

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const streamingMessages = [...newMessages, { role: "assistant" as const, content: "" }];
    setMessages(streamingMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          sessionId,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.sessionId && !sessionId) setSessionId(data.sessionId);
              if (data.text) {
                accumulatedText += data.text;
                setMessages([
                  ...newMessages,
                  { role: "assistant", content: accumulatedText },
                ]);
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please call us at +254 726 461 196.",
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <style>{`
        @keyframes chatbot-rise {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatbot-open {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spark-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 183, 133, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(255, 183, 133, 0); }
        }
        @keyframes typing-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes message-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chatbot-trigger {
          animation: chatbot-rise 0.6s ease forwards, spark-pulse 2.5s ease-in-out 2s infinite;
        }
        .chatbot-panel {
          animation: chatbot-open 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .message-bubble {
          animation: message-in 0.25s ease forwards;
        }
        .typing-dot:nth-child(1) { animation: typing-dot 1.2s ease-in-out infinite; }
        .typing-dot:nth-child(2) { animation: typing-dot 1.2s ease-in-out 0.2s infinite; }
        .typing-dot:nth-child(3) { animation: typing-dot 1.2s ease-in-out 0.4s infinite; }
        .chat-messages::-webkit-scrollbar { width: 3px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: #4f453d; border-radius: 2px; }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: "28px",
          left: "28px",
          zIndex: 9999,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        {isOpen && (
          <div
            className="chatbot-panel"
            style={{
              position: "absolute",
              bottom: "80px",
              left: "0",
              width: "360px",
              maxHeight: "520px",
              background: "#131313",
              border: "1px solid rgba(232, 191, 155, 0.25)",
              borderTop: "2px solid #e8bf9b",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                background: "#0e0e0e",
                borderBottom: "1px solid rgba(79, 69, 61, 0.5)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "linear-gradient(135deg, #442b12, #2c1602)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8bf9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "1px",
                    right: "1px",
                    width: "8px",
                    height: "8px",
                    background: "#ffb785",
                    borderRadius: "50%",
                    border: "1.5px solid #0e0e0e",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#e8bf9b", fontFamily: "Playfair Display, serif", letterSpacing: "0.01em" }}>
                  The AI Artisan
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "#9c8e84", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em" }}>
                  FORGE &amp; TIMBER · ONLINE
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9c8e84", fontSize: "20px", padding: "4px", display: "flex", alignItems: "center", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e8bf9b")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9c8e84")}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div
              className="chat-messages"
              style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "200px", maxHeight: "300px" }}
            >
              {/* Not signed in: show sign-in prompt instead of chat */}
              {isLoaded && !isSignedIn && (
                <div className="message-bubble">
                  <div
                    style={{
                      background: "#20201f",
                      border: "1px solid rgba(79,69,61,0.5)",
                      borderLeft: "3px solid #e8bf9b",
                      padding: "12px 14px",
                      maxWidth: "90%",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "13px", color: "#e5e2e1", lineHeight: "1.6" }}>
                      Karibu! Please sign in to chat with the AI Artisan — this lets us save your conversation and link it to your bookings.
                    </p>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <SignInButton mode="modal">
                      <button
                        style={{
                          background: "#e8bf9b",
                          border: "none",
                          padding: "9px 16px",
                          color: "#442b12",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Sign In
                      </button>
                    </SignInButton>
                  </div>
                </div>
              )}

              {/* Welcome message - only when signed in */}
              {isSignedIn && messages.length === 0 && (
                <div className="message-bubble">
                  <div
                    style={{
                      background: "#20201f",
                      border: "1px solid rgba(79,69,61,0.5)",
                      borderLeft: "3px solid #e8bf9b",
                      padding: "12px 14px",
                      maxWidth: "90%",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "13px", color: "#e5e2e1", lineHeight: "1.6" }}>
                      Karibu. I'm the AI Artisan — trained on decades of timber and steel craft. Ask me anything about our bespoke furniture, materials, pricing, or book a consultation.
                    </p>
                  </div>
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        style={{
                          background: "none",
                          border: "1px solid rgba(79,69,61,0.6)",
                          padding: "7px 12px",
                          color: "#d3c4b9",
                          fontSize: "12px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s",
                          fontFamily: "Inter, sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#e8bf9b";
                          e.currentTarget.style.color = "#e8bf9b";
                          e.currentTarget.style.background = "rgba(232,191,155,0.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(79,69,61,0.6)";
                          e.currentTarget.style.color = "#d3c4b9";
                          e.currentTarget.style.background = "none";
                        }}
                      >
                        → {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className="message-bubble" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 14px",
                      fontSize: "13px",
                      lineHeight: "1.6",
                      ...(msg.role === "user"
                        ? { background: "#e8bf9b", color: "#2c1602", fontWeight: 500 }
                        : { background: "#20201f", color: "#e5e2e1", border: "1px solid rgba(79,69,61,0.5)", borderLeft: "3px solid #e8bf9b" }),
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message-bubble" style={{ display: "flex" }}>
                  <div style={{ background: "#20201f", border: "1px solid rgba(79,69,61,0.5)", borderLeft: "3px solid #e8bf9b", padding: "12px 16px", display: "flex", gap: "5px", alignItems: "center" }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="typing-dot" style={{ width: "6px", height: "6px", background: "#e8bf9b", borderRadius: "50%" }} />
                    ))}
                  </div>
                </div>
              )}
              {!isLoading && messages.length > 0 && messages[messages.length - 1].role === "assistant" && messages[messages.length - 1].content === "" && (
                <div className="message-bubble" style={{ display: "flex" }}>
                  <div style={{ background: "#20201f", border: "1px solid rgba(79,69,61,0.5)", borderLeft: "3px solid #e8bf9b", padding: "12px 16px" }}>
                    <span style={{ display: "inline-block", width: "2px", height: "14px", background: "#e8bf9b", animation: "typing-dot 0.8s ease-in-out infinite" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - disabled when not signed in */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid rgba(79,69,61,0.4)",
                background: "#0e0e0e",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isSignedIn ? "Ask about timber, steel, pricing..." : "Sign in to chat"}
                disabled={isLoading || !isSignedIn}
                style={{
                  flex: 1,
                  background: "#20201f",
                  border: "1px solid rgba(79,69,61,0.5)",
                  padding: "10px 14px",
                  color: "#e5e2e1",
                  fontSize: "13px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  fontFamily: "Inter, sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e8bf9b")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(79,69,61,0.5)")}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim() || !isSignedIn}
                style={{
                  background: input.trim() && isSignedIn ? "#e8bf9b" : "#353535",
                  border: "none",
                  width: "40px",
                  height: "40px",
                  cursor: input.trim() && isSignedIn ? "pointer" : "default",
                  color: input.trim() && isSignedIn ? "#442b12" : "#9c8e84",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                ↑
              </button>
            </div>
          </div>
        )}

        {/* Trigger Button */}
        <button
          className="chatbot-trigger"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: "60px",
            height: "60px",
            background: isOpen ? "#e8bf9b" : "#131313",
            border: `2px solid ${isOpen ? "#e8bf9b" : "rgba(232,191,155,0.5)"}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            if (!isOpen) {
              e.currentTarget.style.background = "#20201f";
              e.currentTarget.style.borderColor = "#e8bf9b";
            }
          }}
          onMouseLeave={(e) => {
            if (!isOpen) {
              e.currentTarget.style.background = "#131313";
              e.currentTarget.style.borderColor = "rgba(232,191,155,0.5)";
            }
          }}
        >
          {isOpen ? (
            <span style={{ fontSize: "20px", color: "#442b12" }}>✕</span>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8bf9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="9" y1="10" x2="15" y2="10" />
              <line x1="9" y1="14" x2="13" y2="14" />
            </svg>
          )}
          {!isOpen && messages.length === 0 && (
            <div
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "10px",
                height: "10px",
                background: "#ffb785",
                borderRadius: "50%",
                border: "2px solid #131313",
              }}
            />
          )}
        </button>

        {!isOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "70px",
              left: "0",
              background: "#0e0e0e",
              border: "1px solid rgba(232,191,155,0.3)",
              borderLeft: "3px solid #e8bf9b",
              padding: "6px 12px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            className="chat-tooltip"
          >
            <p style={{ margin: 0, fontSize: "11px", color: "#e8bf9b", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em" }}>
              AI ARTISAN · ASK ANYTHING
            </p>
          </div>
        )}
      </div>
    </>
  );
}