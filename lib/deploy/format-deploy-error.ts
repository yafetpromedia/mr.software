/** Pick the most useful lines from a deploy/build error for the UI. */
export function formatDeployErrorMessage(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "Deployment failed";

  const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length <= 8) return trimmed;

  const tail = lines.slice(-8).join("\n");
  return `Build failed — last log lines:\n\n${tail}`;
}
