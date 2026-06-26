import type { Metadata } from "next";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { RegisterForm } from "./register-form";
import { messageForGoogleOAuthError } from "@/lib/auth/google-oauth-errors";
import { isAuthLocked } from "@/lib/auth/auth-lock";
import { safeInternalPath } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a Mr.Software account — identity for your software business.",
};

type Props = {
  searchParams: Promise<{ next?: string; oauth_error?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const { next, oauth_error } = await searchParams;
  const redirectTo = safeInternalPath(next, "/app");

  return (
    <AuthSplitLayout
      eyebrow="Get started"
      title={
        <>
          One identity across your{" "}
          <span className="text-brand-gradient-static">entire operation</span>
        </>
      }
      description="Catalog, dashboard, and admin share the same accounts and roles — governance-ready from day one."
    >
      <header className="mb-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] lg:hidden">
          Register
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] lg:hidden">
          Create your account
        </h1>
        <p className="text-sm text-[var(--muted)] lg:hidden">
          Default role is{" "}
          <strong className="font-semibold text-[var(--foreground)]">USER</strong>.
          Already registered?{" "}
          <Link
            href={`/auth/login?next=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
        <p className="hidden text-sm text-[var(--muted)] lg:block">
          You will start as{" "}
          <strong className="font-semibold text-[var(--foreground)]">USER</strong>.{" "}
          <Link
            href={`/auth/login?next=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
          >
            Already have an account?
          </Link>
        </p>
      </header>
      <RegisterForm
        redirectTo={redirectTo}
        authLocked={isAuthLocked()}
        initialOauthError={
          typeof oauth_error === "string"
            ? messageForGoogleOAuthError(oauth_error)
            : null
        }
      />
    </AuthSplitLayout>
  );
}
