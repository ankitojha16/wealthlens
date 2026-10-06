export function getGeminiConfig(env: Record<string, string | undefined> = process.env) {
  const provider = env.AI_PROVIDER?.trim().toLowerCase() || "google";
  if (provider !== "google") return null;

  const apiKey = env.GOOGLE_GEMINI_API_KEY?.trim() || env.AI_API_KEY?.trim();
  if (!apiKey) return null;

  const configuredModel = env.AI_MODEL?.trim();
  return {
    apiKey,
    model: configuredModel || "gemini-3.8-flash",
  };
}
