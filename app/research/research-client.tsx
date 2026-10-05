"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

const researchQuestions = [
  "Explain the company's recent price movement.",
  "Summarize the latest verified company news.",
  "What verified company information is available?",
];

export default function ResearchClient() {
  const [symbol, setSymbol] = useState("TCS");
  const [question, setQuestion] = useState(researchQuestions[0]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function askResearch() {
    setIsLoading(true);
    setAnswer(null);
    setError(null);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, question }),
      });
      const payload = await response.json() as { answer?: string; error?: string; verifiedContext?: { quote?: { price: number | null; percentChange: number | null }; news?: Array<{ headline: string }> } };
      if (!response.ok) {
        setError(payload.error ?? "Research is unavailable.");
        if (payload.verifiedContext) {
          const quote = payload.verifiedContext.quote;
          const news = payload.verifiedContext.news ?? [];
          setAnswer(`Verified context: price ${quote?.price ?? "unavailable"}, change ${quote?.percentChange ?? "unavailable"}%. Latest verified headlines: ${news.map((item) => item.headline).join(" | ") || "none returned"}.`);
        }
        return;
      }
      setAnswer(payload.answer ?? "The research provider returned no answer.");
    } catch {
      setError("Unable to reach the research service.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#4f665d]">AI research</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#013220]">Ask WealthLens</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-[#dfeee3] bg-white p-5 text-[#013220] shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#013220]">Suggested questions</h2>
          <div className="space-y-3">
            {researchQuestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setQuestion(suggestion)} className="block w-full rounded-xl border border-[#dfeee3] bg-[#f7fff9] p-3 text-left text-sm text-[#013220] transition hover:border-[#32CD32]/40 hover:bg-[#ebfff0]">
                {suggestion}
              </button>
            ))}
            <label className="block pt-3 text-sm font-medium text-[#013220]">Symbol<input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} className="mt-2 w-full rounded-xl border border-[#dfeee3] bg-[#f7fff9] p-3 text-[#013220] outline-none focus:border-[#32CD32]" /></label>
            <label className="block text-sm font-medium text-[#013220]">Question<textarea value={question} onChange={(event) => setQuestion(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-[#dfeee3] bg-[#f7fff9] p-3 text-[#013220] outline-none focus:border-[#32CD32]" /></label>
            <button type="button" onClick={askResearch} disabled={isLoading} className="w-full rounded-xl bg-[#32CD32] px-4 py-3 text-sm font-medium text-[#013220] transition hover:bg-[#89F336] disabled:cursor-not-allowed disabled:opacity-60">
              {isLoading ? "Retrieving verified context..." : "Ask research assistant"}
            </button>
          </div>
        </Card>

        <Card className="border-[#dfeee3] bg-white p-5 text-[#013220] shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#013220]">Research context</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Context-aware</span>
          </div>
          <p className="text-sm text-[#214b3d]">
            The AI assistant can use company data, valuation metrics, and recent market context to answer analytical questions. It does not generate investment recommendations.
          </p>
          {error ? <p role="alert" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error}</p> : null}
          {answer ? <div className="mt-6 rounded-xl bg-[#f5fff7] p-4 text-sm text-[#013220]">{answer}</div> : null}
        </Card>
      </div>
    </main>
  );
}
