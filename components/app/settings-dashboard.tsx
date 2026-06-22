"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, Brain, Code2, LogOut, Palette, Shield, User } from "lucide-react";
import {
  DeveloperAccessRequestForm,
} from "@/components/app/developer-access-request-form";
import { DeveloperMemoryForm } from "@/components/app/developer-memory-form";
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

const BASE_SECTION_IDS = ["profile", "ai-memory", "appearance", "security", "notifications", "session"] as const;
type BaseSectionId = (typeof BASE_SECTION_IDS)[number];
type SectionId = BaseSectionId | "developer";

type NavItem = {
  id: SectionId;
  label: string;
  icon: ReactNode;
};

type Props = {
  profile: SettingsProfile;
  settingsHref: string;
  storefrontHandle?: string | null;
};

function isSectionId(value: string, includeDeveloper: boolean): value is SectionId {
  if (value === "developer") return includeDeveloper;
  return BASE_SECTION_IDS.includes(value as BaseSectionId);
}

function SettingsSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="modern-card space-y-5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--accent)]">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
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
  const showDeveloperAccess = profile.role === "USER";
  const [active, setActive] = useState<SectionId>("profile");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (isSectionId(hash, showDeveloperAccess)) setActive(hash);
  }, [showDeveloperAccess]);

  function selectSection(id: SectionId) {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  const nav: NavItem[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" aria-hidden /> },
    { id: "ai-memory", label: "AI Memory", icon: <Brain className="h-4 w-4" aria-hidden /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" aria-hidden /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" aria-hidden /> },
    ...(showDeveloperAccess
      ? [{ id: "developer" as const, label: "Developer access", icon: <Code2 className="h-4 w-4" aria-hidden /> }]
      : []),
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" aria-hidden /> },
    { id: "session", label: "Session", icon: <LogOut className="h-4 w-4" aria-hidden /> },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 lg:max-h-[calc(100dvh-7rem)] lg:min-h-[32rem]">
      <header className="shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-[var(--shadow-card)] sm:px-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Account
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
              Settings
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Profile, security, appearance, and notifications.
            </p>
          </div>
          {storefrontHandle ? (
            <p className="text-sm text-[var(--muted)]">
              Store:{" "}
              <Link href={`/@${storefrontHandle}`} className="font-medium text-[var(--accent)] hover:underline">
                @{storefrontHandle}
              </Link>
            </p>
          ) : null}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-6">
        <nav aria-label="Settings sections" className="shrink-0 lg:min-h-0">
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {nav.map((item) => {
              const selected = active === item.id;
              return (
                <li key={item.id} className="shrink-0">
                  <button
                    type="button"
                    aria-current={selected ? "page" : undefined}
                    onClick={() => selectSection(item.id)}
                    className={`flex min-h-10 w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 lg:min-h-11 lg:py-2.5 ${
                      selected
                        ? "border-[var(--accent)]/35 bg-[var(--accent-muted)]/50 text-[var(--foreground)]"
                        : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-h-0 flex-1 lg:overflow-y-auto lg:pr-1">
          {active === "profile" ? (
            <SettingsSection
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
          ) : null}

          {active === "ai-memory" ? (
            <SettingsSection
              title="Developer Memory Profile"
              description="Who you are, how you build, and your AI team — injected into every Mr.Software AI request."
              icon={<Brain className="h-4 w-4" aria-hidden />}
            >
              <DeveloperMemoryForm />
            </SettingsSection>
          ) : null}

          {active === "appearance" ? (
            <SettingsSection
              title="Appearance"
              description="Choose light or dark mode for the workspace and site."
              icon={<Palette className="h-4 w-4" aria-hidden />}
            >
              <ThemeSettingsPanel />
            </SettingsSection>
          ) : null}

          {active === "security" ? (
            <SettingsSection
              title="Password & sign-in"
              description="Manage how you sign in to your account."
              icon={<Shield className="h-4 w-4" aria-hidden />}
            >
              <PasswordSettingsForm hasPassword={profile.hasPassword} hasGoogle={profile.hasGoogle} />
            </SettingsSection>
          ) : null}

          {active === "developer" && showDeveloperAccess ? (
            <SettingsSection
              title="Developer access"
              description="Request promotion to publish software, deploy apps, and run a storefront."
              icon={<Code2 className="h-4 w-4" aria-hidden />}
            >
              <DeveloperAccessRequestForm />
            </SettingsSection>
          ) : null}

          {active === "notifications" ? (
            <SettingsSection
              title="Notifications"
              description="Control in-app alerts, browser push, and email digests."
              icon={<Bell className="h-4 w-4" aria-hidden />}
            >
              <NotificationSettingsForm settingsHref={settingsHref} />
            </SettingsSection>
          ) : null}

          {active === "session" ? (
            <SettingsSection
              title="Session"
              description="Sign out on this device when you're done."
              icon={<LogOut className="h-4 w-4" aria-hidden />}
            >
              <PortalSettingsForm />
            </SettingsSection>
          ) : null}
        </div>
      </div>
    </div>
  );
}
