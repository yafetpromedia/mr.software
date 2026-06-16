"use client";

/**
 * Root error UI (required by the App Router). Must be a Client Component and
 * include its own <html> / <body> — avoids Turbopack “global-error.js” manifest issues.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          background: "#09090b",
          color: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#a1a1aa", marginBottom: "1.25rem" }}>
            {process.env.NODE_ENV === "development" && error?.message
              ? error.message
              : "An unexpected error occurred. Try again or refresh the page."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              borderRadius: "0.75rem",
              border: "none",
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              background: "#6366f1",
              color: "#fff",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
