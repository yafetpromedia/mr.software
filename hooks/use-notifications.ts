"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NotificationItem } from "@/lib/notifications/types";

type State = {
  notifications: NotificationItem[];
  unreadCount: number;
  connected: boolean;
  loading: boolean;
};

export function useNotifications() {
  const [state, setState] = useState<State>({
    notifications: [],
    unreadCount: 0,
    connected: false,
    loading: true,
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: NotificationItem[];
        unreadCount: number;
      };
      setState((s) => ({
        ...s,
        notifications: data.notifications,
        unreadCount: data.unreadCount,
        loading: false,
      }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const es = new EventSource("/api/notifications/stream");
    eventSourceRef.current = es;

    es.onopen = () => {
      setState((s) => ({ ...s, connected: true }));
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as {
          type: string;
          notification?: NotificationItem;
          unreadCount?: number;
        };
        if (data.type === "unread" && typeof data.unreadCount === "number") {
          setState((s) => ({ ...s, unreadCount: data.unreadCount! }));
        }
        if (data.type === "notification" && data.notification) {
          const n = data.notification;
          setState((s) => ({
            ...s,
            notifications: [n, ...s.notifications.filter((x) => x.id !== n.id)].slice(0, 50),
            unreadCount: s.unreadCount + (n.read ? 0 : 1),
          }));
        }
      } catch {
        /* ignore malformed */
      }
    };

    es.onerror = () => {
      setState((s) => ({ ...s, connected: false }));
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  const markRead = useCallback(async (id: string) => {
    const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) return;
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  }, []);

  const markAllRead = useCallback(async () => {
    const res = await fetch("/api/notifications/read-all", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return;
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  }, []);

  return { ...state, refresh, markRead, markAllRead };
}
