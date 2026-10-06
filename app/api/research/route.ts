import { getCompanyResearch, getNews, getQuote } from "@/lib/market-api";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getGeminiConfig } from "@/lib/ai-provider";

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

async function generateGeminiAnswer(question: string, context: unknown) {
  const config = getGeminiConfig();
  if (!config) return null;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: "You are WealthLens Research Assistant. Answer the user's specific question using only the verified IndianAPI context provided. Give a direct answer followed by 2-3 distinct evidence-based analytical perspectives or contributing factors relevant to that question. Explain what the data supports, distinguish plausible interpretations from established facts, and say clearly when context is insufficient. Do not repeat a generic company summary, invent facts, prices, news, or provide investment recommendations." }],
      },
      contents: [{
        role: "user",
        parts: [{ text: `Question: ${question}\n\nVerified context:\n${JSON.stringify(context)}` }],
      }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1200 },
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
    if (!getGeminiConfig()) {
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
