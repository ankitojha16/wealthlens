import { getCompanyResearch, getHistoricalData, getNews, getQuote } from "@/lib/market-api";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getGeminiConfig } from "@/lib/ai-provider";

type GeminiResponse = {
  error?: { message?: string };
  promptFeedback?: { blockReason?: string };
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

type ConversationTurn = { question: string; answer: string };

async function generateGeminiAnswer(question: string, context: unknown, conversation: ConversationTurn[]) {
  const config = getGeminiConfig();
  if (!config) return null;

  let response: Response;
  try {
    const companyContext = JSON.stringify(context);
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "You are WealthLens Research Assistant. Answer the user's exact question using only the verified company context provided. Start with a concise direct answer, then give 2-3 distinct, question-specific evidence-based observations. Do not reuse a generic template: make the response materially different when the question asks about different topics such as price trends, valuation, debt, peers, or news. Cite the context values or dates that support each point. If the context does not contain evidence needed for the question, say what is missing instead of filling space with a general summary. Separate facts from interpretations. Do not invent facts, prices, news, or provide investment recommendations." }],
        },
        contents: [{
          role: "user",
          parts: [
            ...(conversation.length > 0 ? [{
              text: `Conversation so far (use only to understand references in the current question; prior answers are not verified evidence):\n${conversation.map((turn) => `User: ${turn.question}\nAssistant: ${turn.answer}`).join("\n\n")}`,
            }] : []),
            { text: `Answer this exact question: ${question}` },
            { text: `Use only this verified context as factual evidence:\n${companyContext}` },
          ],
        }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1600 },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    const reason = error instanceof Error && error.name === "TimeoutError"
      ? "Google Gemini did not respond before the request timed out."
      : "Could not connect to Google Gemini. Check the provider network and configuration.";
    return { error: reason, status: 502 };
  }

  let payload: GeminiResponse;
  try {
    payload = await response.json() as GeminiResponse;
  } catch {
    return { error: `Google Gemini returned an unreadable response (HTTP ${response.status}).`, status: 502 };
  }

  if (!response.ok) {
    const detail = payload.error?.message?.replaceAll(config.apiKey, "[redacted]").slice(0, 300);
    return {
      error: `Google Gemini rejected the request (HTTP ${response.status})${detail ? `: ${detail}` : "."}`,
      status: 502,
    };
  }

  const answer = payload.candidates?.[0]?.content?.parts?.map((part) => part.text?.trim()).filter((text): text is string => Boolean(text)).join("\n");
  if (answer) return answer;

  const reason = payload.promptFeedback?.blockReason ?? payload.candidates?.[0]?.finishReason;
  return {
    error: reason
      ? `Google Gemini did not generate an answer (${reason}). Try rephrasing the question.`
      : "Google Gemini returned no answer. Try rephrasing the question or check the configured model.",
    status: 502,
  };
}

export async function POST(request: Request) {
  try {
    const { data: { user } } = await (await getSupabaseServerClient()).auth.getUser();
    if (!user) return Response.json({ error: "Authentication is required." }, { status: 401 });

    const body = await request.json() as {
      symbol?: unknown;
      question?: unknown;
      conversation?: unknown;
    };
    const symbol = typeof body.symbol === "string" ? body.symbol.trim().toUpperCase() : "";
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!symbol || !question) {
      return Response.json({ error: "A symbol and question are required." }, { status: 400 });
    }
    if (question.length > 1000) {
      return Response.json({ error: "Keep questions under 1,000 characters." }, { status: 400 });
    }
    const conversation: ConversationTurn[] = Array.isArray(body.conversation)
      ? body.conversation.slice(-4).flatMap((turn): ConversationTurn[] => {
        if (!turn || typeof turn !== "object") return [];
        const { question: previousQuestion, answer: previousAnswer } = turn as Record<string, unknown>;
        if (typeof previousQuestion !== "string" || typeof previousAnswer !== "string") return [];
        return [{ question: previousQuestion.slice(0, 1000), answer: previousAnswer.slice(0, 3000) }];
      })
      : [];

    const [company, quote, news, history] = await Promise.all([
      getCompanyResearch(symbol),
      getQuote(symbol),
      getNews(symbol),
      getHistoricalData(symbol, "1yr"),
    ]);

    if (!company || !quote) {
      return Response.json({ error: "Verified IndianAPI data is unavailable for this symbol." }, { status: 404 });
    }

    const verifiedContext = {
      company,
      quote,
      news: news.slice(0, 5),
      priceHistory: history.filter((point) => point.close !== null).slice(-30).map(({ date, close }) => ({ date, close })),
    };
    if (!getGeminiConfig()) {
      return Response.json({
        error: "AI provider is not configured. Verified context was retrieved, but no generated answer was produced.",
        verifiedContext,
      }, { status: 503 });
    }

    const answer = await generateGeminiAnswer(question, verifiedContext, conversation);
    if (typeof answer !== "string") {
      return Response.json({ error: answer?.error ?? "The configured AI provider did not return an answer.", verifiedContext }, { status: answer?.status ?? 502 });
    }

    return Response.json({ answer, verifiedContext });
  } catch {
    return Response.json({ error: "Unable to retrieve verified research context." }, { status: 500 });
  }
}
