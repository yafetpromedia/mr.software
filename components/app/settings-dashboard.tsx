"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Bell, LogOut, Palette, Shield, User } from "lucide-react";
import { PasswordSettingsForm } from "@/components/app/password-settings-form";
import { PortalSettingsForm } from "@/components/app/portal-settings-form";
import { ProfileSettingsForm } from "@/components/app/profile-settings-form";
import { ThemeSettingsPanel } from "@/components/app/theme-settings-panel";
import { NotificationSettingsForm } from "@/components/notifications/notification-settings-form";

export type SettingsProfile = {
  name: string;
  email: string;
  role: string;
  hasPassword: boolean;
  hasGoogle: boolean;
  memberSince: string;
  stripeLinked?: boolean;
};

type NavItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

type Props = {
  profile: SettingsProfile;
  settingsHref: string;
  storefrontHandle?: string | null;
};

function SettingsSection({
  id,
  title,
  description,
  icon,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="modern-card scroll-mt-24 space-y-5 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)]">
          {icon}
        </span>
        <div>
          <h2 id={`${id}-heading`} className="text-base font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function SettingsDashboard({ profile, settingsHref, storefrontHandle }: Props) {
  const nav: NavItem[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" aria-hidden /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" aria-hidden /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" aria-hidden /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" aria-hidden /> },
    { id: "session", label: "Session", icon: <LogOut className="h-4 w-4" aria-hidden /> },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 100% 0%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 58%)",
          }}
        />
        <div className="relative max-w-2xl">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Account
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]">
            Update your profile, security, appearance, and notifications — everything in one place with
            clear sections you can jump to.
          </p>
          {storefrontHandle ? (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Public store:{" "}
              <Link href={`/@${storefrontHandle}`} className="font-medium text-[var(--accent)] hover:underline">
                mr.software/@{storefrontHandle}
              </Link>
            </p>
          ) : null}
        </div>
      </section>

      <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-8">
        <nav
          aria-label="Settings sections"
          className="mb-2 lg:sticky lg:top-6 lg:mb-0 lg:self-start"
        >
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {nav.map((item) => (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  className="flex min-h-11 items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 lg:w-full"
                >
                  {item.icon}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6">
          <SettingsSection
            id="profile"
            title="Profile"
            description="Your name and email used across Mr.Software."
            icon={<User className="h-4 w-4" aria-hidden />}
          >
            <ProfileSettingsForm
              initialName={profile.name}
              initialEmail={profile.email}
              role={profile.role}
              memberSince={profile.memberSince}
              stripeLinked={profile.stripeLinked}
            />
          </SettingsSection>

          <SettingsSection
            id="appearance"
            title="Appearance"
            description="Choose light or dark mode for the workspace and site."
            icon={<Palette className="h-4 w-4" aria-hidden />}
          >
            <ThemeSettingsPanel />
          </SettingsSection>

          <SettingsSection
            id="security"
            title="Password & sign-in"
            description="Manage how you sign in to your account."
            icon={<Shield className="h-4 w-4" aria-hidden />}
          >
            <PasswordSettingsForm hasPassword={profile.hasPassword} hasGoogle={profile.hasGoogle} />
          </SettingsSection>

          <SettingsSection
            id="notifications"
            title="Notifications"
            description="Control in-app alerts, browser push, and email digests."
            icon={<Bell className="h-4 w-4" aria-hidden />}
          >
            <NotificationSettingsForm settingsHref={settingsHref} />
          </SettingsSection>

          <SettingsSection
            id="session"
            title="Session"
            description="Sign out on this device when you're done."
            icon={<LogOut className="h-4 w-4" aria-hidden />}
          >
            <PortalSettingsForm />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
