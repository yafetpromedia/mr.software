/** When `thumbnailUrl` is null in DB, pick a stable image from the listing id. */
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop&q=80&auto=format",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop&q=80&auto=format",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop&q=80&auto=format",
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=450&fit=crop&q=80&auto=format",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop&q=80&auto=format",
  "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=450&fit=crop&q=80&auto=format",
] as const;

export function resolveThumbnailUrl(
  stored: string | null | undefined,
  id: string,
): string {
  if (stored && stored.trim()) return stored.trim();
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i) * (i + 1)) % 1_000_000;
  }
  return FALLBACK_IMAGES[h % FALLBACK_IMAGES.length];
}
