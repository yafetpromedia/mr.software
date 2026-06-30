/** Query param `oauth_error` from `/api/auth/callback/google` redirects. */
export function messageForGoogleOAuthError(code: string): string | null {
  switch (code) {
    case "config":
      return "Google sign-in is not set up on this server. Ask the administrator to add Google OAuth credentials.";
    case "denied":
      return "Google sign-in was cancelled.";
    case "state":
      return "That sign-in link expired or was invalid. Please try again.";
    case "token":
      return "Could not finish signing in with Google. Please try again.";
    case "email":
      return "Your Google account email is not verified. Verify it with Google, then try again.";
    case "email_policy":
      return "Use a real email address you can access. Temporary or disposable inboxes aren't allowed.";
    case "link":
      return "This Google account cannot be linked to the existing profile for that email.";
    case "auth_lock":
      return "Sign-in and registration are temporarily disabled while maintenance is in progress. Only administrators can sign in.";
    case "banned":
      return "This account has been banned.";
    case "db":
      return "Could not reach the database. Check DATABASE_URL and that PostgreSQL is running, then try again.";
    case "db_schema":
      return "Database is missing Google sign-in columns (or password is still required). In the project folder run: npx prisma db push";
    case "google":
      return "Google returned an error during sign-in. Try again or use email and password.";
    case "unknown":
      return "Google sign-in failed. Please try again.";
    default:
      return "Google sign-in failed. Please try again.";
  }
}
