"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AiTeam,
  CreatorDna,
  DeveloperMemoryProfileView,
  DeveloperProfileJson,
  DeveloperProject,
} from "@/lib/ai/developer-memory/schema";

function commaList(values?: string[]): string {
  return values?.join(", ") ?? "";
}

function parseCommaList(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function emptyProject(): DeveloperProject {
  return { name: "", type: "", status: "Active" };
}

type FormState = {
  profile: DeveloperProfileJson;
  creatorDna: CreatorDna;
  team: AiTeam;
  currentProjectName: string;
  currentProjectCategory: string;
  aiContextNotes: string;
};

function profileToForm(profile: DeveloperMemoryProfileView): FormState {
  return {
    profile: profile.profile,
    creatorDna: profile.creatorDna,
    team: profile.team,
    currentProjectName: profile.currentProjectName ?? "",
    currentProjectCategory: profile.currentProjectCategory ?? "",
    aiContextNotes: profile.aiContextNotes ?? "",
  };
}

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--foreground)]">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

function TextArea({
  label,
  id,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--foreground)]">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

export function DeveloperMemoryForm() {
  const [form, setForm] = useState<FormState | null>(null);
  const [previewYaml, setPreviewYaml] = useState("");
  const [builtByLine, setBuiltByLine] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/developer-memory", { credentials: "include" });
      const data = (await res.json()) as {
        error?: string;
        profile?: DeveloperMemoryProfileView;
      };
      if (!res.ok || !data.profile) {
        throw new Error(data.error ?? "Could not load AI memory profile");
      }
      setForm(profileToForm(data.profile));
      setPreviewYaml(data.profile.aiContextYaml);
      setBuiltByLine(data.profile.builtByLine);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function patchDeveloper(field: keyof NonNullable<DeveloperProfileJson["developer"]>, value: string) {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            profile: {
              ...prev.profile,
              developer: { ...prev.profile.developer, [field]: value },
            },
          }
        : prev,
    );
  }

  function patchVision(field: keyof NonNullable<DeveloperProfileJson["vision"]>, value: string) {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            profile: {
              ...prev.profile,
              vision: { ...prev.profile.vision, [field]: value },
            },
          }
        : prev,
    );
  }

  function patchTeam(field: keyof AiTeam, value: string) {
    setForm((prev) => (prev ? { ...prev, team: { ...prev.team, [field]: value } } : prev));
  }

  function patchDna(field: keyof CreatorDna, value: string | string[]) {
    setForm((prev) => (prev ? { ...prev, creatorDna: { ...prev.creatorDna, [field]: value } } : prev));
  }

  function patchProject(index: number, field: keyof DeveloperProject, value: string) {
    setForm((prev) => {
      if (!prev) return prev;
      const projects = [...(prev.profile.projects ?? [])];
      projects[index] = { ...projects[index], [field]: value };
      return { ...prev, profile: { ...prev.profile, projects } };
    });
  }

  function addProject() {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            profile: {
              ...prev.profile,
              projects: [...(prev.profile.projects ?? []), emptyProject()],
            },
          }
        : prev,
    );
  }

  function removeProject(index: number) {
    setForm((prev) => {
      if (!prev) return prev;
      const projects = (prev.profile.projects ?? []).filter((_, i) => i !== index);
      return { ...prev, profile: { ...prev.profile, projects } };
    });
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setStatus("");
    setError("");
    try {
      const payload = {
        profile: {
          ...form.profile,
          projects: (form.profile.projects ?? []).filter((p) => p.name.trim()),
          skills: parseCommaList(commaList(form.profile.skills)),
        },
        creatorDna: {
          ...form.creatorDna,
          preferredColors: parseCommaList(commaList(form.creatorDna.preferredColors)),
          focus: parseCommaList(commaList(form.creatorDna.focus)),
          values: parseCommaList(commaList(form.creatorDna.values)),
        },
        team: form.team,
        currentProjectName: form.currentProjectName.trim() || null,
        currentProjectCategory: form.currentProjectCategory.trim() || null,
        aiContextNotes: form.aiContextNotes.trim() || null,
      };

      const res = await fetch("/api/account/developer-memory", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        error?: string;
        profile?: DeveloperMemoryProfileView;
      };
      if (!res.ok || !data.profile) {
        throw new Error(data.error ?? "Could not save profile");
      }
      setForm(profileToForm(data.profile));
      setPreviewYaml(data.profile.aiContextYaml);
      setBuiltByLine(data.profile.builtByLine);
      setStatus("Developer Memory Profile saved. Mr.Software AI will use this on every request.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading AI memory profile…</p>;
  }

  if (!form) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600 dark:text-red-400">{error || "Could not load profile."}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--background)]"
        >
          Retry
        </button>
      </div>
    );
  }

  const dev = form.profile.developer ?? {};
  const vision = form.profile.vision ?? {};

  return (
    <form onSubmit={(e) => void onSave(e)} className="space-y-8">
      <p className="text-sm leading-relaxed text-[var(--muted)]">
        This profile teaches Mr.Software AI who you are and how you build. It is injected into every AI
        request automatically. Legal ownership and license records stay separate in the trust system.
      </p>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-[var(--foreground)]">Creator profile</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" id="dm-name" value={dev.name ?? ""} onChange={(v) => patchDeveloper("name", v)} />
          <Field label="Handle" id="dm-handle" value={dev.handle ?? ""} onChange={(v) => patchDeveloper("handle", v)} placeholder="@yafet" />
          <Field label="Organization" id="dm-org" value={dev.organization ?? ""} onChange={(v) => patchDeveloper("organization", v)} />
          <Field label="Role" id="dm-role" value={dev.role ?? ""} onChange={(v) => patchDeveloper("role", v)} />
          <Field label="Country" id="dm-country" value={dev.country ?? ""} onChange={(v) => patchDeveloper("country", v)} />
          <Field label="City" id="dm-city" value={dev.city ?? ""} onChange={(v) => patchDeveloper("city", v)} />
          <Field label="Website" id="dm-website" value={dev.website ?? ""} onChange={(v) => patchDeveloper("website", v)} />
          <Field label="Email" id="dm-email" value={dev.email ?? ""} onChange={(v) => patchDeveloper("email", v)} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-[var(--foreground)]">Vision</legend>
        <Field label="Mission" id="dm-mission" value={vision.mission ?? ""} onChange={(v) => patchVision("mission", v)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary platform" id="dm-platform" value={vision.primaryPlatform ?? ""} onChange={(v) => patchVision("primaryPlatform", v)} />
          <Field label="Company" id="dm-company" value={vision.company ?? ""} onChange={(v) => patchVision("company", v)} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-[var(--foreground)]">Creator DNA</legend>
        <Field label="Design style" id="dm-style" value={form.creatorDna.designStyle ?? ""} onChange={(v) => patchDna("designStyle", v)} placeholder="Modern, futuristic, premium" />
        <Field label="Preferred colors" id="dm-colors" value={commaList(form.creatorDna.preferredColors)} onChange={(v) => patchDna("preferredColors", parseCommaList(v))} hint="Comma-separated" />
        <Field label="Focus areas" id="dm-focus" value={commaList(form.creatorDna.focus)} onChange={(v) => patchDna("focus", parseCommaList(v))} hint="African startups, SaaS products, …" />
        <Field label="Values" id="dm-values" value={commaList(form.creatorDna.values)} onChange={(v) => patchDna("values", parseCommaList(v))} />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-[var(--foreground)]">AI team identity</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Founder" id="dm-founder" value={form.team.founder ?? ""} onChange={(v) => patchTeam("founder", v)} />
          <Field label="AI architect" id="dm-architect" value={form.team.aiArchitect ?? ""} onChange={(v) => patchTeam("aiArchitect", v)} />
          <Field label="AI developer" id="dm-aidev" value={form.team.aiDeveloper ?? ""} onChange={(v) => patchTeam("aiDeveloper", v)} />
        </div>
        {builtByLine ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Attribution preview</p>
            <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-[var(--foreground)]">{builtByLine}</pre>
          </div>
        ) : null}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-[var(--foreground)]">Current project focus</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project name" id="dm-cur-name" value={form.currentProjectName} onChange={(v) => setForm({ ...form, currentProjectName: v })} placeholder="CampusOne" />
          <Field label="Category" id="dm-cur-cat" value={form.currentProjectCategory} onChange={(v) => setForm({ ...form, currentProjectCategory: v })} placeholder="Education SaaS" />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Projects</legend>
          <button type="button" onClick={addProject} className="text-sm font-medium text-[var(--accent)] hover:underline">
            Add project
          </button>
        </div>
        {(form.profile.projects ?? []).length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No projects listed yet.</p>
        ) : (
          <ul className="space-y-3">
            {(form.profile.projects ?? []).map((project, index) => (
              <li key={index} className="grid gap-3 rounded-xl border border-[var(--border)] p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
                <Field label="Name" id={`dm-proj-name-${index}`} value={project.name} onChange={(v) => patchProject(index, "name", v)} />
                <Field label="Type" id={`dm-proj-type-${index}`} value={project.type ?? ""} onChange={(v) => patchProject(index, "type", v)} />
                <Field label="Status" id={`dm-proj-status-${index}`} value={project.status ?? ""} onChange={(v) => patchProject(index, "status", v)} />
                <div className="flex items-end">
                  <button type="button" onClick={() => removeProject(index)} className="text-sm text-red-600 hover:underline dark:text-red-400">
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <Field label="Skills" id="dm-skills" value={commaList(form.profile.skills)} onChange={(v) => setForm({ ...form, profile: { ...form.profile, skills: parseCommaList(v) } })} hint="Comma-separated" />

      <TextArea
        label="AI context notes"
        id="dm-notes"
        value={form.aiContextNotes}
        onChange={(v) => setForm({ ...form, aiContextNotes: v })}
        hint="Optional reminders for Mr.Software AI — not stored as legal ownership."
      />

      {previewYaml ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">AI context preview</p>
          <pre className="mt-2 overflow-x-auto text-xs leading-relaxed text-[var(--foreground)]">{previewYaml}</pre>
        </div>
      ) : null}

      {status ? <p className="text-sm text-green-700 dark:text-green-400">{status}</p> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save AI memory profile"}
      </button>
    </form>
  );
}
