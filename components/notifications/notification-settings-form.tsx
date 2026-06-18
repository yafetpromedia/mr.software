"use client";

import type { EmailDigestFrequency, NotificationKind } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import {
  ALL_NOTIFICATION_KINDS,
  type NotificationPreferencesDto,
  NOTIFICATION_KIND_LABELS,
} from "@/lib/notifications/constants";
import {
  subscribeToBrowserPush,
  unsubscribeFromBrowserPush,
} from "@/lib/notifications/push-client";

type Props = {
  settingsHref?: string;
};

export function NotificationSettingsForm({ settingsHref = "/app/settings" }: Props) {
  const [prefs, setPrefs] = useState<NotificationPreferencesDto | null>(null);
  const [pushConfigured, setPushConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prefRes, pushRes] = await Promise.all([
        fetch("/api/notifications/preferences", { credentials: "include" }),
        fetch("/api/notifications/push/vapid-public-key"),
      ]);
      if (prefRes.ok) {
        const data = (await prefRes.json()) as { preferences: NotificationPreferencesDto };
        setPrefs(data.preferences);
      }
      if (pushRes.ok) {
        const data = (await pushRes.json()) as { configured: boolean };
        setPushConfigured(data.configured);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (next: Partial<NotificationPreferencesDto>) => {
      if (!prefs) return;
      setSaving(true);
      setError(null);
      setMessage(null);
      const merged = { ...prefs, ...next };
      try {
        const res = await fetch("/api/notifications/preferences", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        const data = (await res.json()) as {
          error?: string;
          preferences?: NotificationPreferencesDto;
        };
        if (!res.ok) {
          setError(data.error ?? "Could not save preferences");
          return;
        }
        setPrefs(data.preferences ?? merged);
        setMessage("Saved");
      } catch {
        setError("Could not save preferences");
      } finally {
        setSaving(false);
      }
    },
    [prefs],
  );

  const toggleKind = (kind: NotificationKind) => {
    if (!prefs) return;
    const muted = new Set(prefs.mutedKinds);
    if (muted.has(kind)) muted.delete(kind);
    else muted.add(kind);
    void save({ mutedKinds: [...muted] });
  };

  const onPushToggle = async (enabled: boolean) => {
    if (!prefs) return;
    if (enabled) {
      if (!pushConfigured) {
        setError("Browser push is not configured on this server (VAPID keys missing).");
        return;
      }
      if (!("Notification" in window)) {
        setError("This browser does not support notifications.");
        return;
      }
      try {
        await subscribeToBrowserPush();
        await save({ pushEnabled: true });
        setMessage("Browser notifications enabled");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not enable push notifications");
      }
      return;
    }
    try {
      await unsubscribeFromBrowserPush();
      await save({ pushEnabled: false });
      setMessage("Browser notifications disabled");
    } catch {
      setError("Could not disable push notifications");
    }
  };

  const onDigestChange = (emailDigest: EmailDigestFrequency) => {
    void save({ emailDigest });
  };

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading notification settings…</p>;
  }

  if (!prefs) {
    return <p className="text-sm text-[var(--muted)]">Could not load notification settings.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          In-app categories
        </h3>
        <p className="text-sm text-[var(--muted)]">
          Muted categories won&apos;t appear in the bell or trigger browser push.
        </p>
        <ul className="space-y-2">
          {ALL_NOTIFICATION_KINDS.map((kind) => {
            const muted = prefs.mutedKinds.includes(kind);
            return (
              <li key={kind} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--foreground)]">{NOTIFICATION_KIND_LABELS[kind]}</span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => toggleKind(kind)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 ${
                    muted ? "bg-[var(--border)]" : "bg-[var(--accent)]"
                  }`}
                  aria-pressed={!muted}
                  aria-label={`${NOTIFICATION_KIND_LABELS[kind]} notifications ${muted ? "off" : "on"}`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                      muted ? "left-0.5" : "left-[1.375rem]"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-3 border-t border-[var(--border)] pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Browser push
        </h3>
        <p className="text-sm text-[var(--muted)]">
          Get alerts even when Mr.Software isn&apos;t focused. Requires permission in your browser.
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-[var(--foreground)]">Enable push</span>
          <button
            type="button"
            disabled={saving || !pushConfigured}
            onClick={() => void onPushToggle(!prefs.pushEnabled)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 ${
              prefs.pushEnabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"
            } ${!pushConfigured ? "opacity-50" : ""}`}
            aria-pressed={prefs.pushEnabled}
            aria-label="Browser push notifications"
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                prefs.pushEnabled ? "left-[1.375rem]" : "left-0.5"
              }`}
            />
          </button>
        </div>
        {!pushConfigured ? (
          <p className="text-xs text-[var(--muted)]">
            Server needs VAPID keys in <code className="text-[var(--foreground)]">.env</code> (see
            .env.example).
          </p>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-[var(--border)] pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Email digest
        </h3>
        <p className="text-sm text-[var(--muted)]">
          A summary of notifications sent to your account email. Requires{" "}
          <code className="text-[var(--foreground)]">RESEND_API_KEY</code> on the server.
        </p>
        <select
          id="email-digest-frequency"
          value={prefs.emailDigest}
          disabled={saving}
          onChange={(e) => onDigestChange(e.target.value as EmailDigestFrequency)}
          className="h-11 w-full max-w-xs rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          aria-label="Email digest frequency"
        >
          <option value="OFF">Off</option>
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
        </select>
        <p className="text-xs text-[var(--muted)]">
          Summaries are sent to your account email when enabled on the server.
        </p>
      </div>

      {message ? (
        <p className="text-sm text-emerald-600" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
