"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NotificationKind } from "@prisma/client";
import {
  Bell,
  Cloud,
  CreditCard,
  Package,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import type { NotificationItem } from "@/lib/notifications/types";

function kindIcon(kind: NotificationKind) {
  switch (kind) {
    case "DEPLOYMENT":
      return Cloud;
    case "AI":
      return Sparkles;
    case "MARKETPLACE":
      return Package;
    case "BILLING":
      return CreditCard;
    case "STOREFRONT":
      return Store;
    case "SYSTEM":
      return Zap;
    default:
      return Zap;
  }
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

function NotificationRow({
  item,
  onRead,
  onNavigate,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
  onNavigate: () => void;
}) {
  const Icon = kindIcon(item.kind);
  const inner = (
    <>
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          item.read ? "bg-[var(--background)] text-[var(--muted)]" : "bg-[var(--accent-muted)] text-[var(--accent)]"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={`text-sm font-medium ${item.read ? "text-[var(--foreground)]" : "text-[var(--foreground)]"}`}>
            {item.title}
          </span>
          <span className="shrink-0 text-[0.65rem] text-[var(--muted)]">{formatWhen(item.createdAt)}</span>
        </span>
        <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">{item.body}</span>
      </span>
      {!item.read ? (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
      ) : null}
    </>
  );

  const className = `flex w-full gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--accent-muted)]/30 ${
    item.read ? "" : "bg-[var(--accent-muted)]/10"
  }`;

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={className}
        onClick={() => {
          if (!item.read) onRead(item.id);
          onNavigate();
        }}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (!item.read) onRead(item.id);
        onNavigate();
      }}
    >
      {inner}
    </button>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, connected, loading, markRead, markAllRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--foreground)]"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[0.6rem] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
        {connected ? (
          <span
            className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]"
            title="Live"
            aria-hidden
          />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Notifications</p>
              <p className="text-[0.65rem] text-[var(--muted)]">
                {connected ? "Real-time" : "Reconnecting…"}
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs font-medium text-[var(--accent)] hover:underline"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
            {loading ? (
              <p className="py-8 text-center text-xs text-[var(--muted)]">Loading…</p>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-[var(--muted)] opacity-40" aria-hidden />
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">All caught up</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Deployments, AI saves, and storefront activity appear here instantly.
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <NotificationRow
                      item={n}
                      onRead={markRead}
                      onNavigate={() => setOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
