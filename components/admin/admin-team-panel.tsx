"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminTeamMember, PublicTeamSectionSettings } from "@/lib/team-types";

type TeamMemberKind = AdminTeamMember["kind"];

const KIND_OPTIONS: { value: TeamMemberKind; label: string }[] = [
  { value: "HUMAN", label: "Human" },
  { value: "AI_CAPABILITY", label: "AI capability" },
  { value: "ECOSYSTEM", label: "Ecosystem" },
];

function emptyMember(): Omit<AdminTeamMember, "id" | "createdAt" | "updatedAt"> {
  return {
    kind: "HUMAN",
    name: "",
    role: "",
    bio: "",
    avatarUrl: null,
    monogram: null,
    published: true,
    sortOrder: 0,
  };
}

function kindBadge(kind: TeamMemberKind) {
  const styles = {
    HUMAN: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    AI_CAPABILITY: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
    ECOSYSTEM: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  } as const;
  const labels = {
    HUMAN: "Human",
    AI_CAPABILITY: "AI capability",
    ECOSYSTEM: "Ecosystem",
  } as const;
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${styles[kind]}`}
    >
      {labels[kind]}
    </span>
  );
}

export function AdminTeamPanel() {
  const [settings, setSettings] = useState<PublicTeamSectionSettings | null>(null);
  const [members, setMembers] = useState<AdminTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState(emptyMember());
  const [savingMember, setSavingMember] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team", { credentials: "include" });
      const data = (await res.json()) as {
        error?: string;
        settings?: PublicTeamSectionSettings;
        members?: AdminTeamMember[];
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load team");
      setSettings(data.settings ?? null);
      setMembers(data.members ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load team");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings() {
    if (!settings) return;
    setSavingSettings(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/team/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      const data = (await res.json()) as { error?: string; settings?: PublicTeamSectionSettings };
      if (!res.ok) throw new Error(data.error ?? "Failed to save section copy");
      setSettings(data.settings ?? settings);
      setMessage("Section copy saved — visible on the landing page.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save section copy");
    } finally {
      setSavingSettings(false);
    }
  }

  function startCreate() {
    setEditingId("new");
    setDraft({
      ...emptyMember(),
      sortOrder: members.length > 0 ? Math.max(...members.map((m) => m.sortOrder)) + 1 : 1,
    });
    setMessage("");
  }

  function startEdit(member: AdminTeamMember) {
    setEditingId(member.id);
    setDraft({
      kind: member.kind,
      name: member.name,
      role: member.role,
      bio: member.bio,
      avatarUrl: member.avatarUrl,
      monogram: member.monogram,
      published: member.published,
      sortOrder: member.sortOrder,
    });
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyMember());
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.set("scope", "team");
      formData.set("file", file);
      const res = await fetch("/api/admin/site-assets/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      setDraft((prev) => ({ ...prev, avatarUrl: data.url ?? null }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function saveMember() {
    setSavingMember(true);
    setMessage("");
    try {
      const payload = {
        kind: draft.kind,
        name: draft.name,
        role: draft.role,
        bio: draft.bio,
        avatarUrl: draft.avatarUrl ?? "",
        monogram: draft.monogram ?? "",
        published: draft.published,
        sortOrder: draft.sortOrder,
      };

      const res = await fetch(
        editingId === "new" ? "/api/admin/team/members" : `/api/admin/team/members/${editingId}`,
        {
          method: editingId === "new" ? "POST" : "PATCH",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save profile");

      setMessage(editingId === "new" ? "Profile added." : "Profile updated.");
      cancelEdit();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setSavingMember(false);
    }
  }

  async function removeMember(id: string) {
    if (!window.confirm("Remove this profile from the team section?")) return;
    setMessage("");
    try {
      const res = await fetch(`/api/admin/team/members/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to delete profile");
      setMessage("Profile removed.");
      if (editingId === id) cancelEdit();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete profile");
    }
  }

  if (loading || !settings) {
    return (
      <p className="text-sm text-[var(--muted)]">{loading ? "Loading team…" : "Unable to load team."}</p>
    );
  }

  return (
    <div className="space-y-8">
      {message ? (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]">
          {message}
        </p>
      ) : null}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Section copy</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Headline and intro shown above the team cards on the landing page.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-[var(--foreground)]">Eyebrow</span>
            <input
              value={settings.eyebrow}
              onChange={(e) => setSettings({ ...settings, eyebrow: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[var(--foreground)]">Title</span>
            <input
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-[var(--foreground)]">Tagline</span>
            <input
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-[var(--foreground)]">Intro</span>
            <textarea
              value={settings.intro}
              onChange={(e) => setSettings({ ...settings, intro: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => void saveSettings()}
          disabled={savingSettings}
          className="mt-5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {savingSettings ? "Saving…" : "Save section copy"}
        </button>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Profiles</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Add humans, AI capability cards, or ecosystem entries. AI tools are described by
              role — not listed as people.
            </p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--surface)]"
          >
            Add profile
          </button>
        </div>

        {editingId ? (
          <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--surface)] p-5 sm:p-6">
            <h3 className="font-semibold text-[var(--foreground)]">
              {editingId === "new" ? "New profile" : "Edit profile"}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Kind</span>
                <select
                  value={draft.kind}
                  onChange={(e) =>
                    setDraft({ ...draft, kind: e.target.value as TeamMemberKind })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                >
                  {KIND_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium">Sort order</span>
                <input
                  type="number"
                  min={0}
                  value={draft.sortOrder}
                  onChange={(e) =>
                    setDraft({ ...draft, sortOrder: Number.parseInt(e.target.value, 10) || 0 })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium">Name</span>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Yafet Tesfaye or AI Strategy Partner"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium">Role</span>
                <input
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium">Bio</span>
                <textarea
                  value={draft.bio}
                  onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Monogram (optional)</span>
                <input
                  value={draft.monogram ?? ""}
                  onChange={(e) => setDraft({ ...draft, monogram: e.target.value || null })}
                  maxLength={4}
                  placeholder="Y"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="flex items-center gap-2 text-sm sm:mt-6">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
                />
                <span>Published on landing page</span>
              </label>
              <div className="sm:col-span-2">
                <span className="text-sm font-medium">Avatar (optional)</span>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {draft.avatarUrl ? (
                    <Image
                      src={draft.avatarUrl}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-xl border border-[var(--border)] object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--muted)]">
                      None
                    </div>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadAvatar(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold"
                  >
                    {uploadingAvatar ? "Uploading…" : "Upload photo"}
                  </button>
                  {draft.avatarUrl ? (
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, avatarUrl: null })}
                      className="text-xs text-[var(--muted)] underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void saveMember()}
                disabled={savingMember}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingMember ? "Saving…" : editingId === "new" ? "Add profile" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <ul className="space-y-3">
          {members.length === 0 ? (
            <li className="rounded-xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
              No profiles yet. Add your first profile or run the database seed for defaults.
            </li>
          ) : (
            members.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
              >
                <div className="flex min-w-0 flex-1 gap-4">
                  {member.avatarUrl ? (
                    <Image
                      src={member.avatarUrl}
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-muted)] font-display text-sm font-bold text-[var(--accent)]">
                      {(member.monogram || member.name.charAt(0)).slice(0, 3)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[var(--foreground)]">{member.name}</h3>
                      {kindBadge(member.kind)}
                      {!member.published ? (
                        <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-[var(--muted)]">
                          Hidden
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                      {member.role}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{member.bio}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(member)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeMember(member.id)}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
