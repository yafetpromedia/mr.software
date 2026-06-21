import type { AuthMe } from "@/components/auth/use-auth-me";
import { workspaceHrefFor } from "@/components/auth/use-auth-me";

export type SiteNavLink = { href: string; label: string };

export const PUBLIC_SITE_NAV: SiteNavLink[] = [
  { href: "/#features", label: "Features" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/academy", label: "Academy" },
  { href: "/#partners", label: "Partners" },
  { href: "/#testimonials", label: "Stories" },
  { href: "/#team", label: "Team" },
  { href: "/app/ai", label: "Mr.Software AI" },
];

export function signedInSiteNav(me: AuthMe): SiteNavLink[] {
  const workspaceLabel =
    me.role === "ADMIN" && me.status === "ACTIVE"
      ? "Admin portal"
      : me.role === "USER"
        ? "My library"
        : "Workspace";

  const links: SiteNavLink[] = [
    { href: workspaceHrefFor(me), label: workspaceLabel },
    { href: "/app/marketplace", label: "Marketplace" },
    { href: "/academy", label: "Academy" },
    { href: "/app/ai", label: "Mr.Software AI" },
  ];

  if (me.role === "DEVELOPER") {
    links.splice(2, 0, { href: "/app/storefront", label: "Storefront" });
  }

  return links;
}
