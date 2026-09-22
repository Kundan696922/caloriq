import { useEffect, useRef, useState } from "react";
import ChatHistory from "./ChatHistory";

const MAX_LENGTH = 1000; // matches backend limit

const SUGGESTIONS = [
  "How am I doing on protein today?",
  "Suggest a high-protein snack",
  "What should I eat for dinner?",
];

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-bg px-4 py-3">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-bounce rounded-full bg-text-secondary"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatWindow({ chat, onClose }) {
  const {
    conversations,
    historyLoading,
    activeId,
    messages,
    loadingConversation,
    sending,
    error,
    setError,
    openConversation,
    newChat,
    send,
    deleteConversation,
  } = chat;

  const [showHistory, setShowHistory] = useState(false);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending, showHistory]);

  // Auto-grow the textarea up to ~5 lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [draft, showHistory]);

  async function submit(text) {
    const value = (text ?? draft).trim();
    if (!value || sending) return;
    setDraft("");
    const ok = await send(value);
    if (!ok) setDraft(value); // restore so the user can retry
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  async function handleSelect(id) {
    await openConversation(id);
    setShowHistory(false);
  }

  function handleNew() {
    newChat();
    setShowHistory(false);
  }

  const busy = sending || loadingConversation;

  return (
    <div
      role="dialog"
      aria-label="Caloriq Coach chat"
      className="fixed bottom-20 right-4 z-50 flex h-[32rem] max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/60 sm:right-6 sm:w-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Caloriq Coach</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={showHistory ? "Back to chat" : "Chat history"}
            onClick={() => setShowHistory((v) => !v)}
            className={`rounded-lg p-2 transition-colors hover:bg-bg ${
              showHistory ? "text-accent" : "text-text-secondary"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5M12 7v5l3 2" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="New chat"
            onClick={handleNew}
            disabled={busy}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Close chat"
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      {showHistory ? (
        <ChatHistory
          conversations={conversations}
          activeId={activeId}
          loading={historyLoading}
          disabled={busy}
          onSelect={handleSelect}
          onDelete={deleteConversation}
          onNew={handleNew}
        />
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {loadingConversation ? (
              <p className="py-10 text-center text-sm text-text-secondary">
                Loading conversation…
              </p>
            ) : messages.length === 0 && !sending ? (
              <div className="pt-4 text-center">
                <p className="text-sm font-medium">
                  Hi! I'm your Caloriq Coach.
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Ask me about your meals, macros, or goals.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => submit(s)}
                      className="rounded-lg border border-border bg-bg px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:border-accent/60 hover:text-text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm bg-accent text-black"
                        : "rounded-bl-sm border border-border bg-bg text-text-primary"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}

            {sending && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start justify-between gap-2 border-t border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-300">
              <span>{error}</span>
              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
                className="shrink-0 text-red-300 hover:text-red-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={MAX_LENGTH}
                disabled={loadingConversation}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about food, macros, goals…"
                className="max-h-[120px] flex-1 resize-none rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none disabled:opacity-50"
              />
              <button
                type="button"
                aria-label="Send message"
                onClick={() => submit()}
                disabled={!draft.trim() || busy}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-black transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
