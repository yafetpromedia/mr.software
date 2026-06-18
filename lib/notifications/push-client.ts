function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
}

async function getVapidPublicKey(): Promise<string> {
  const res = await fetch("/api/notifications/push/vapid-public-key");
  if (!res.ok) throw new Error("Push is not available");
  const data = (await res.json()) as { publicKey: string | null; configured: boolean };
  if (!data.configured || !data.publicKey) {
    throw new Error("Push is not configured on this server");
  }
  return data.publicKey;
}

async function ensureServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported");
  }
  return navigator.serviceWorker.register("/sw.js");
}

export async function subscribeToBrowserPush(): Promise<void> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission denied");
  }

  const publicKey = await getVapidPublicKey();
  const registration = await ensureServiceWorker();
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Invalid push subscription");
  }

  const res = await fetch("/api/notifications/push/subscribe", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Failed to save push subscription");
  }
}

export async function unsubscribeFromBrowserPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();

  await fetch("/api/notifications/push/unsubscribe", {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  });
}

export async function syncPushSubscriptionIfEnabled(): Promise<void> {
  const res = await fetch("/api/notifications/preferences", { credentials: "include" });
  if (!res.ok) return;
  const data = (await res.json()) as {
    preferences: { pushEnabled: boolean };
  };
  if (!data.preferences.pushEnabled) return;
  if (Notification.permission !== "granted") return;

  try {
    await subscribeToBrowserPush();
  } catch {
    /* user may have revoked permission */
  }
}
