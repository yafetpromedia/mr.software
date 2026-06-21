"use client";

import { useEffect, useState } from "react";

export type AuthMe = {
  id: string;
  email: string;
  name: string;
  role: string;
  status?: string;
};

export function workspaceHrefFor(me: AuthMe): string {
  if (me.role === "ADMIN" && me.status === "ACTIVE") return "/admin";
  if (me.role === "USER") return "/app/home";
  return "/app";
}

export function useAuthMe(): AuthMe | null | undefined {
  const [me, setMe] = useState<AuthMe | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { user?: AuthMe } | null) => setMe(data?.user ?? null))
      .catch(() => setMe(null));
  }, []);

  return me;
}
