import { getDeveloperMemoryProfile } from "@/lib/ai/developer-memory/profile";

const CREATOR_CONTEXT_HEADER = `Developer Memory Profile (creative context only — legal ownership and license records are managed separately by the platform and must not be inferred or modified from this block):

`;

/**
 * Loads the signed-in creator's memory profile and returns a system-prompt appendix.
 * Returns empty string if the profile cannot be loaded.
 */
export async function getCreatorContextBlock(userId: string): Promise<string> {
  const profile = await getDeveloperMemoryProfile(userId);
  if (!profile?.aiContextYaml.trim()) return "";

  return `${CREATOR_CONTEXT_HEADER}\`\`\`yaml
${profile.aiContextYaml}
\`\`\`

When generating copy, designs, or architecture:
- Match the creator's design language and values from creator_dna.
- Align output with their platform mission and current_project when relevant.
- You may reference the team attribution line when appropriate: "${profile.builtByLine.replace(/\n/g, " | ")}".`;
}

export function appendCreatorContext(systemPrompt: string, creatorBlock: string): string {
  if (!creatorBlock.trim()) return systemPrompt;
  return `${systemPrompt}\n\n${creatorBlock}`;
}
