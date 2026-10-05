import { getCompanyResearch, getNews, getQuote } from "@/lib/market-api";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

async function generateGeminiAnswer(question: string, context: unknown) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim() || "gemini-2.5-flash";
  if (process.env.AI_PROVIDER?.trim().toLowerCase() !== "google" || !apiKey) return null;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: "You are WealthLens Research Assistant. Answer only from the verified IndianAPI context provided. Clearly say when context is insufficient. Do not invent facts, prices, news, or investment recommendations." }],
      },
      contents: [{
        role: "user",
        parts: [{ text: `Question: ${question}\n\nVerified context:\n${JSON.stringify(context)}` }],
      }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 800 },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) return null;
  const payload = await response.json() as GeminiResponse;
  return payload.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join("\n") ?? null;
}

export async function POST(request: Request) {
  try {
    const { data: { user } } = await (await getSupabaseServerClient()).auth.getUser();
    if (!user) return Response.json({ error: "Authentication is required." }, { status: 401 });

    const body = await request.json() as { symbol?: unknown; question?: unknown };
    const symbol = typeof body.symbol === "string" ? body.symbol.trim().toUpperCase() : "";
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!symbol || !question) {
      return Response.json({ error: "A symbol and question are required." }, { status: 400 });
    }

    const [company, quote, news] = await Promise.all([
      getCompanyResearch(symbol),
      getQuote(symbol),
      getNews(symbol),
    ]);

    if (!company || !quote) {
      return Response.json({ error: "Verified IndianAPI data is unavailable for this symbol." }, { status: 404 });
    }

    const verifiedContext = { company, quote, news: news.slice(0, 5) };
    if (process.env.AI_PROVIDER?.trim().toLowerCase() !== "google" || !process.env.GOOGLE_GEMINI_API_KEY?.trim()) {
      return Response.json({
        error: "AI provider is not configured. Verified context was retrieved, but no generated answer was produced.",
        verifiedContext,
      }, { status: 503 });
    }

    const answer = await generateGeminiAnswer(question, verifiedContext);
    if (!answer) {
      return Response.json({ error: "The configured AI provider did not return an answer.", verifiedContext }, { status: 502 });
    }

    return Response.json({ answer, verifiedContext });
  } catch {
    return Response.json({ error: "Unable to retrieve verified research context." }, { status: 500 });
  }
}
