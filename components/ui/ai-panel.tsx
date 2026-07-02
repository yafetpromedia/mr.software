"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, History, Plus, Trash2 } from "lucide-react";
import { CommandInput } from "@/components/ui/command-input";
import { PanelSectionControls } from "@/components/ui/panel-section-controls";
import { BRAND_AI_NAME } from "@/lib/branding/constants";

const WORKFLOWS = [
  "Analyze a school management SaaS idea",
  "Plan a fitness tracker startup",
  "Draft marketplace listing copy",
  "Design deployment architecture",
] as const;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type HistoryItem = {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
};

type Props = {
  minimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
  onRestore?: () => void;
};

function msgId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function AiPanel({ minimized = false, onMinimize, onClose, onRestore }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const loadConversation = useCallback(async (id?: string) => {
    const url = id ? `/api/ai/copilot?conversationId=${encodeURIComponent(id)}` : "/api/ai/copilot";
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      conversation?: { id: string; messages: ChatMessage[] } | null;
      history?: HistoryItem[];
    };
    if (data.history) setHistory(data.history);
    if (data.conversation) {
      setConversationId(data.conversation.id);
      setMessages(
        data.conversation.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      );
      return data.conversation.id;
    }
    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadConversation();
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadConversation]);

  useEffect(() => {
    if (!showHistory) scrollToBottom();
  }, [messages, loading, showHistory, scrollToBottom]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setInput("");
    setLoading(true);
    setShowHistory(false);

    const userMsg: ChatMessage = { id: msgId(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, conversationId: conversationId ?? undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Message failed");
        return;
      }
      if (typeof data.conversationId === "string") {
        setConversationId(data.conversationId);
      }
      const reply = typeof data.reply === "string" ? data.reply : "";
      if (reply) {
        setMessages((prev) => [...prev, { id: msgId(), role: "assistant", content: reply }]);
      }
      void loadConversation(data.conversationId);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setInput("");
    setShowHistory(false);
  }

  async function deleteConversation(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/ai/conversations/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not delete chat");
        return;
      }
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (conversationId === id) {
        setMessages([]);
        setConversationId(null);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function openHistoryItem(id: string) {
    setBooting(true);
    setError(null);
    setShowHistory(false);
    try {
      await loadConversation(id);
    } finally {
      setBooting(false);
    }
  }

  if (minimized) {
    return (
      <aside
        className="flex w-10 shrink-0 flex-col border-l border-[var(--border)] bg-[var(--surface)]"
        aria-label={`${BRAND_AI_NAME} Copilot`}
      >
        <button
          type="button"
          onClick={onRestore}
          className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-[var(--muted)] transition hover:bg-[var(--accent-muted)] hover:text-[var(--foreground)]"
          aria-label="Expand AI panel"
          title="Expand AI panel"
        >
          <span className="text-sm text-[var(--accent)]" aria-hidden>
            ✦
          </span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-wider [writing-mode:vertical-rl]">
            AI
          </span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="flex h-full w-80 min-w-0 shrink-0 flex-col overflow-hidden border-l border-[var(--border)] bg-[var(--surface)]"
      aria-label={`${BRAND_AI_NAME} Copilot`}
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] px-4">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Copilot
          </p>
          <p className="truncate text-sm font-medium text-[var(--foreground)]">
            {showHistory ? "Chat history" : BRAND_AI_NAME}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {showHistory ? (
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="rounded-md p-1.5 text-[var(--muted)] transition hover:bg-[var(--accent-muted)] hover:text-[var(--foreground)]"
              aria-label="Back to chat"
              title="Back"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className="rounded-md p-1.5 text-[var(--muted)] transition hover:bg-[var(--accent-muted)] hover:text-[var(--foreground)]"
                aria-label="Chat history"
                title="History"
              >
                <History className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={startNewChat}
                className="rounded-md p-1.5 text-[var(--muted)] transition hover:bg-[var(--accent-muted)] hover:text-[var(--foreground)]"
                aria-label="New chat"
                title="New chat"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </>
          )}
          {onMinimize || onClose ? (
            <PanelSectionControls
              side="right"
              onMinimize={onMinimize ?? (() => undefined)}
              onClose={onClose ?? (() => undefined)}
            />
          ) : null}
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto p-4">
        {showHistory ? (
          history.length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--muted)]">
              No past chats yet. Start a conversation below.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {history.map((h) => (
                <li key={h.id}>
                  <div
                    className={`flex items-stretch gap-1 rounded-xl border transition hover:border-[var(--accent)]/30 hover:bg-[var(--accent-muted)] ${
                      h.id === conversationId
                        ? "border-[var(--accent)]/40 bg-[var(--accent-muted)]/50"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void openHistoryItem(h.id)}
                      className="min-w-0 flex-1 px-3 py-2.5 text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium text-[var(--foreground)]">
                          {h.title}
                        </span>
                        <span className="shrink-0 text-[0.65rem] text-[var(--muted)]">
                          {formatWhen(h.updatedAt)}
                        </span>
                      </div>
                      {h.preview ? (
                        <p className="mt-1 truncate text-[0.65rem] text-[var(--muted)]">{h.preview}</p>
                      ) : null}
                      <p className="mt-0.5 text-[0.6rem] text-[var(--muted)]">
                        {h.messageCount} message{h.messageCount === 1 ? "" : "s"}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteConversation(h.id)}
                      disabled={deletingId === h.id}
                      className="shrink-0 self-center rounded-lg p-2 text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                      aria-label={`Delete ${h.title}`}
                      title="Delete chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : booting && messages.length === 0 ? (
          <div className="space-y-2">
            <div className="h-12 animate-pulse rounded-xl bg-[var(--border-subtle)]" />
            <div className="h-8 animate-pulse rounded-xl bg-[var(--border-subtle)]" />
          </div>
        ) : messages.length === 0 ? (
          <>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
              <p className="text-sm font-medium text-[var(--foreground)]">{BRAND_AI_NAME} Engine</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                Ask anything about startups, architecture, listings, or deployment. Chats are saved
                automatically.
              </p>
            </div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Workflows
            </p>
            <ul className="space-y-1.5">
              {WORKFLOWS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void sendMessage(s)}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-left text-xs text-[var(--foreground)] transition hover:border-[var(--accent)]/30 hover:bg-[var(--accent-muted)] disabled:opacity-50"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
            <Link
              href="/app/ai"
              className="block text-center text-xs font-medium text-[var(--accent)] hover:underline"
            >
              Open full AI modules →
            </Link>
          </>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`flex min-w-0 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[92%] min-w-0 rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{m.content}</p>
                </div>
              </li>
            ))}
            {loading ? (
              <li className="flex justify-start">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--muted)]">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
                    {BRAND_AI_NAME} is thinking…
                  </span>
                </div>
              </li>
            ) : null}
          </ul>
        )}

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        ) : null}
      </div>

      {!showHistory ? (
        <div className="min-w-0 shrink-0 border-t border-[var(--border)] p-3">
          <CommandInput
            value={input}
            onChange={setInput}
            placeholder={`Ask ${BRAND_AI_NAME}…`}
            disabled={loading}
            onSubmit={() => void sendMessage(input)}
          />
        </div>
      ) : null}
    </aside>
  );
}
