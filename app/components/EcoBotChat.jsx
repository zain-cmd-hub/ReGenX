"use client";

import { useEffect, useRef, useState } from "react";

const QUICK_REPLIES = [
  "How do I analyze a product?",
  "What is an Eco Certificate?",
  "How to recycle electronics?",
  "What is an eco score?",
];

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm **EcoBot** 🌱 — your eco-sustainability assistant.\n\nI can help you with:\n• Recycling & waste management\n• Product analysis (sell / repair / recycle)\n• Eco impact & certificates\n• Using this platform\n\nHow can I help you today?",
};

function formatMessage(text) {
  // Bold: **text**
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Bullet points starting with •
    .replace(/^•\s(.+)/gm, "<li>$1</li>")
    // Numbered list 1. 2. 3.
    .replace(/^\d+\.\s(.+)/gm, "<li>$1</li>")
    // New lines → <br>
    .replace(/\n/g, "<br>");

  // Wrap consecutive <li> with <ul>
  html = html.replace(/(<li>.*?<\/li>)(<br>)?/gs, (m) => m);
  return html;
}

export default function EcoBotChat({ theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setHasUnread(false);
    }
  }, [isOpen]);

  async function sendMessage(text) {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;

    setInput("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    // Build the payload: strip the welcome message, keep only real conversation turns
    const conversationHistory = newMessages.filter(
      (m) => !(m.role === "assistant" && m === WELCOME_MESSAGE)
    );

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = data?.error || `Server error (${res.status})`;
        console.error("[EcoBot] API error:", res.status, errMsg);
        const userFacingMsg = "🌱 EcoBot is temporarily unavailable. Please try again in a moment.";
        setMessages((prev) => [...prev, { role: "assistant", content: userFacingMsg }]);
        if (!isOpen) setHasUnread(true);
        return;
      }

      // Success — use reply; if somehow empty, ask user to rephrase
      const reply = data.reply?.trim()
        ? data.reply
        : "I could not understand that. Could you please rephrase your question? 🌱";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (!isOpen) setHasUnread(true);

    } catch (err) {
      // Network / fetch failure
      console.error("[EcoBot] Network error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "🔌 Could not reach EcoBot. Please check your internet connection and try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([WELCOME_MESSAGE]);
  }

  const isDark = theme === "dark";

  return (
    <>
      {/* Floating button */}
      <button
        className={`ecobot-fab${hasUnread ? " ecobot-fab--unread" : ""}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close EcoBot chat" : "Open EcoBot chat"}
        title="EcoBot — Eco Assistant"
      >
        {isOpen ? (
          <span className="ecobot-fab-icon">✕</span>
        ) : (
          <span className="ecobot-fab-icon">♻️</span>
        )}
        {hasUnread && <span className="ecobot-fab-badge" />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="ecobot-window" role="dialog" aria-label="EcoBot Chat">
          {/* Header */}
          <div className="ecobot-header">
            <div className="ecobot-header-left">
              <div className="ecobot-avatar">🌱</div>
              <div>
                <div className="ecobot-title">EcoBot</div>
                <div className="ecobot-subtitle">Eco-sustainability assistant</div>
              </div>
            </div>
            <div className="ecobot-header-actions">
              <button
                className="ecobot-clear-btn"
                onClick={clearChat}
                title="Clear chat"
                aria-label="Clear chat"
              >
                🗑
              </button>
              <button
                className="ecobot-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="ecobot-messages" role="log" aria-live="polite">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`ecobot-msg ecobot-msg--${msg.role}`}
              >
                {msg.role === "assistant" && (
                  <div className="ecobot-msg-avatar">🌱</div>
                )}
                <div
                  className="ecobot-msg-bubble"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
            ))}

            {isLoading && (
              <div className="ecobot-msg ecobot-msg--assistant">
                <div className="ecobot-msg-avatar">🌱</div>
                <div className="ecobot-msg-bubble ecobot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies (only show if last message is from assistant and few messages) */}
          {messages.length <= 3 && messages[messages.length - 1]?.role === "assistant" && (
            <div className="ecobot-quick-replies">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  className="ecobot-quick-btn"
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="ecobot-input-row">
            <textarea
              ref={inputRef}
              className="ecobot-input"
              rows={1}
              placeholder="Ask about recycling, eco impact…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Chat message input"
            />
            <button
              className="ecobot-send-btn"
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              {isLoading ? (
                <span className="ecobot-send-spinner" />
              ) : (
                "➤"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
