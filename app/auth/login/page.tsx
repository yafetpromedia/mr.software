import type { Metadata } from "next";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "./login-form";
import { messageForGoogleOAuthError } from "@/lib/auth/google-oauth-errors";
import { safeInternalPath } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to Mr.Software — infrastructure for your software business.",
};

type Props = {
  searchParams: Promise<{ next?: string; oauth_error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { next, oauth_error } = await searchParams;
  const redirectTo = safeInternalPath(next, "/app");

  return (
    <AuthSplitLayout
      eyebrow="Account access"
      title={
        <>
          Sign in to your{" "}
          <span className="text-brand-gradient-static">workspace</span>
        </>
      }
      description="Sign in with Google or email. New accounts start as USER; admins can promote developers when you are ready to ship on this stack."
    >
      <header className="mb-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] lg:hidden">
          Sign in
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] lg:hidden">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--muted)] lg:hidden">
          New here?{" "}
          <Link
            href={`/auth/register?next=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
        <p className="hidden text-sm text-[var(--muted)] lg:block">
          Enter your email and password to continue.{" "}
          <Link
            href={`/auth/register?next=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
          >
            Need an account?
          </Link>
        </p>
      </header>
      <LoginForm
        redirectTo={redirectTo}
        initialOauthError={
          typeof oauth_error === "string"
            ? messageForGoogleOAuthError(oauth_error)
            : null
        }
      />
    </AuthSplitLayout>
  );
}
