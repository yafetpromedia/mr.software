"use client";

import { useEffect } from "react";
import { syncPushSubscriptionIfEnabled } from "@/lib/notifications/push-client";

/** Re-subscribes browser push when the user already enabled it (new device / cleared SW). */
export function NotificationPushSync() {
  useEffect(() => {
    void syncPushSubscriptionIfEnabled();
  }, []);
  return null;
}
