import type { NotificationItem } from "@/lib/notifications/types";

type Listener = (notification: NotificationItem) => void;

const globalBus = globalThis as unknown as {
  __mrNotificationListeners?: Map<string, Set<Listener>>;
};

function listeners(): Map<string, Set<Listener>> {
  if (!globalBus.__mrNotificationListeners) {
    globalBus.__mrNotificationListeners = new Map();
  }
  return globalBus.__mrNotificationListeners;
}

export function subscribeToNotifications(userId: string, listener: Listener): () => void {
  const map = listeners();
  if (!map.has(userId)) map.set(userId, new Set());
  map.get(userId)!.add(listener);
  return () => {
    map.get(userId)?.delete(listener);
  };
}

export function publishNotification(userId: string, notification: NotificationItem) {
  const set = listeners().get(userId);
  if (!set) return;
  for (const listener of set) {
    try {
      listener(notification);
    } catch (e) {
      console.error("notification listener error", e);
    }
  }
}
