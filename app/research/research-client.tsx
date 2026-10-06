"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

const researchQuestions = [
  "Explain the company's recent price movement.",
  "Summarize the latest verified company news.",
  "What verified company information is available?",
];

type VerifiedContext = {
  company?: { name?: string; symbol?: string };
  quote?: { price: number | null; percentChange: number | null };
  news?: Array<{ headline: string }>;
};

export default function ResearchClient() {
  const [symbol, setSymbol] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [verifiedContext, setVerifiedContext] = useState<VerifiedContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function askResearch() {
    if (!symbol.trim() || !question.trim()) return;

    setIsLoading(true);
    setAnswer(null);
    setVerifiedContext(null);
    setError(null);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, question }),
      });
      const payload = await response.json() as { answer?: string; error?: string; verifiedContext?: VerifiedContext };
      setVerifiedContext(payload.verifiedContext ?? null);
      if (!response.ok) {
        setError(payload.error ?? "Research is unavailable.");
        return;
      }
      if (!payload.answer?.trim()) {
        setError("The research provider returned an empty answer.");
        return;
      }
      setAnswer(payload.answer);
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
            <label className="block pt-3 text-sm font-medium text-[#013220]">Company symbol<input required value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} className="mt-2 w-full rounded-xl border border-[#dfeee3] bg-[#f7fff9] p-3 text-[#013220] outline-none focus:border-[#32CD32]" placeholder="Enter a stock symbol, e.g. INFY" /></label>
            <label className="block text-sm font-medium text-[#013220]">Your question<textarea required value={question} onChange={(event) => setQuestion(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-[#dfeee3] bg-[#f7fff9] p-3 text-[#013220] outline-none focus:border-[#32CD32]" placeholder="Ask a specific question about this company" /></label>
            <button type="button" onClick={askResearch} disabled={isLoading || !symbol.trim() || !question.trim()} className="w-full rounded-xl bg-[#32CD32] px-4 py-3 text-sm font-medium text-[#013220] transition hover:bg-[#89F336] disabled:cursor-not-allowed disabled:opacity-60">
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
            Enter a company symbol and your question. Answers use verified company data and offer several evidence-based analytical perspectives, not investment recommendations.
          </p>
          {error ? <p role="alert" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error}</p> : null}
          {answer ? <div className="mt-6 whitespace-pre-wrap rounded-xl bg-[#f5fff7] p-4 text-sm leading-7 text-[#013220]">{answer}</div> : null}
          {verifiedContext ? (
            <div className="mt-6 rounded-xl border border-[#dfeee3] bg-[#f7fff9] p-4 text-sm text-[#013220]">
              <h3 className="font-semibold">{verifiedContext.company?.name ?? verifiedContext.company?.symbol ?? symbol} verified data</h3>
              <p className="mt-2">
                Price: {verifiedContext.quote?.price ?? "unavailable"} · Change: {verifiedContext.quote?.percentChange == null ? "unavailable" : `${verifiedContext.quote.percentChange}%`}
              </p>
              {verifiedContext.news?.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  {verifiedContext.news.map((item, index) => <li key={`${index}-${item.headline}`}>{item.headline}</li>)}
                </ul>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
