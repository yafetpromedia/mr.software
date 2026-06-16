import Link from "next/link";

export default function SoftwareNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-lg font-semibold text-foreground">
        Software not found
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        This listing does not exist or was removed.
      </p>
      <Link
        href="/marketplace"
        className="mt-6 text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        Back to catalog
      </Link>
    </div>
  );
}
