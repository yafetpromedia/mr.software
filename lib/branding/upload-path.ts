/** User-uploaded brand assets (admin site settings). Not in git — persist via Docker volume in prod. */
export function isRuntimeBrandUpload(src: string): boolean {
  return src.startsWith("/brand/uploads/");
}
