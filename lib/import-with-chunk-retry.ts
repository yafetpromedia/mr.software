function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "ChunkLoadError" ||
    error.message.includes("Loading chunk") ||
    error.message.includes("Failed to fetch dynamically imported module")
  );
}

/** Retry dynamic imports when dev HMR invalidates stale chunk URLs. */
export async function importWithChunkRetry<T>(
  loader: () => Promise<T>,
  retries = 2,
): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    if (!isChunkLoadError(error)) throw error;

    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return importWithChunkRetry(loader, retries - 1);
    }

    if (typeof window !== "undefined") {
      const reloadKey = "mr-chunk-reload";
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, "1");
        window.location.reload();
        return new Promise(() => {});
      }
      sessionStorage.removeItem(reloadKey);
    }

    throw error;
  }
}
