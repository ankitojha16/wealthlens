"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, Search, Send, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

type CompanyMatch = {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  price: number | null;
  percentChange: number | null;
  status: string;
};

type VerifiedCompany = {
  symbol: string;
  name: string;
  exchange: string;
  industry: string | null;
  price: number | null;
  status: string;
};

type VerifiedContext = {
  company?: { name?: string; symbol?: string };
  quote?: { price: number | null; percentChange: number | null };
  news?: Array<{ headline: string }>;
};

type ConversationTurn = {
  question: string;
  answer: string;
};

export default function ResearchClient({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [companyQuery, setCompanyQuery] = useState("");
  const [matches, setMatches] = useState<CompanyMatch[]>([]);
  const [verifiedCompany, setVerifiedCompany] = useState<VerifiedCompany | null>(null);
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [verifiedContext, setVerifiedContext] = useState<VerifiedContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function resetCompany() {
    setVerifiedCompany(null);
    setMatches([]);
    setConversation([]);
    setVerifiedContext(null);
    setError(null);
  }

  async function findCompanies() {
    if (!companyQuery.trim()) return;
    setIsSearching(true);
    resetCompany();
    try {
      const response = await fetch("/api/company-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: companyQuery }),
      });
      const payload = await response.json() as { matches?: CompanyMatch[]; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Unable to search the market data provider.");
        return;
      }
      setMatches(payload.matches ?? []);
      if (!payload.matches?.length) setError("No listed stock matched that name. Check the spelling or try its ticker symbol.");
    } catch {
      setError("Could not reach the company verification service.");
    } finally {
      setIsSearching(false);
    }
  }

  async function verifyCompany(match: CompanyMatch) {
    setIsVerifying(true);
    setError(null);
    setVerifiedCompany(null);
    try {
      const response = await fetch("/api/company-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: companyQuery, symbol: match.symbol }),
      });
      const payload = await response.json() as { verified?: VerifiedCompany; error?: string };
      if (!response.ok || !payload.verified) {
        setError(payload.error ?? "The selected company could not be verified.");
        return;
      }
      setVerifiedCompany(payload.verified);
      setConversation([]);
      setVerifiedContext(null);
    } catch {
      setError("Could not verify this stock with the market data provider.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function askResearch() {
    if (!verifiedCompany || !question.trim() || !isAuthenticated) return;
    setIsLoading(true);
    setVerifiedContext(null);
    setError(null);
    const submittedQuestion = question.trim();
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: verifiedCompany.symbol,
          question: submittedQuestion,
          conversation,
        }),
      });
      const payload = await response.json() as { answer?: string; error?: string; verifiedContext?: VerifiedContext };
      setVerifiedContext(payload.verifiedContext ?? null);
      if (!response.ok) {
        setError(payload.error ?? "Research is unavailable.");
        return;
      }
      const generatedAnswer = payload.answer?.trim();
      if (!generatedAnswer) {
        setError("The research provider returned an empty answer.");
        return;
      }
      setConversation((current) => [...current, { question: submittedQuestion, answer: generatedAnswer }]);
      setQuestion("");
    } catch {
      setError("Unable to reach the research service.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="ai-research" className="mx-auto max-w-5xl scroll-mt-8 px-6 py-14">
      <Card className="overflow-hidden border-[#dfeee3] bg-white p-0 text-[#013220] shadow-[0_18px_50px_rgba(1,50,32,0.08)]">
        <div className="border-b border-[#e5eee7] bg-gradient-to-r from-[#f1fff4] via-white to-[#f5fff7] px-6 py-7 md:px-9">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#013220] text-[#89F336]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4f665d]">WealthLens AI</p>
              <h2 className="mt-1 text-2xl font-semibold text-[#013220] md:text-3xl">Ask about any listed company</h2>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#4f665d]">
            Verify the company against market data first, then ask a question. Answers use available company, price history, and news data.
          </p>
        </div>

        <div className="grid gap-7 px-6 py-7 md:px-9 md:py-8">
          <div>
            <label htmlFor="company-query" className="mb-2 block text-sm font-semibold text-[#013220]">1. Find a company</label>
            <form onSubmit={(event) => { event.preventDefault(); void findCompanies(); }} className="flex flex-col gap-3 sm:flex-row">
              <input
                id="company-query"
                required
                maxLength={100}
                value={companyQuery}
                onChange={(event) => { setCompanyQuery(event.target.value); resetCompany(); }}
                className="min-w-0 flex-1 rounded-xl border border-[#d5e5d9] bg-white px-4 py-3 text-sm text-[#013220] outline-none placeholder:text-[#7b8d82] focus:border-[#32CD32] focus:ring-2 focus:ring-[#32CD32]/15"
                placeholder="Company name or ticker, e.g. Infosys or INFY"
              />
              <button type="submit" disabled={isSearching || !companyQuery.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#013220] px-5 py-3 text-sm font-semibold text-white hover:bg-[#075032] disabled:cursor-not-allowed disabled:opacity-60">
                {isSearching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isSearching ? "Searching..." : "Find company"}
              </button>
            </form>
          </div>

          {matches.length > 0 && !verifiedCompany ? (
            <div className="space-y-2" aria-live="polite">
              <p className="text-sm font-semibold text-[#013220]">Select the correct match to verify it:</p>
              {matches.map((match) => (
                <button key={match.symbol} type="button" onClick={() => void verifyCompany(match)} disabled={isVerifying} className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#dfeee3] bg-[#f8fff9] px-4 py-3 text-left transition hover:border-[#32CD32] hover:bg-[#f0fff3] disabled:opacity-60">
                  <span>
                    <span className="block font-medium text-[#013220]">{match.name}</span>
                    <span className="mt-1 block text-xs text-[#5f7468]">{match.symbol} · {match.exchange}{match.sector ? ` · ${match.sector}` : ""}</span>
                  </span>
                  {isVerifying ? <LoaderCircle className="h-4 w-4 animate-spin text-[#006400]" /> : <span className="text-xs font-semibold text-[#006400]">Verify</span>}
                </button>
              ))}
            </div>
          ) : null}

          {verifiedCompany ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4" role="status">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#013220]">Verified listed company</p>
                  <p className="mt-1 text-sm text-[#214b3d]">{verifiedCompany.name} · {verifiedCompany.symbol} · {verifiedCompany.exchange}</p>
                  <p className="mt-1 text-xs text-[#4f665d]">
                    {verifiedCompany.industry ?? "Industry unavailable"} · Price {verifiedCompany.price === null ? "unavailable" : `₹${verifiedCompany.price.toLocaleString("en-IN")}`} · {verifiedCompany.status}
                  </p>
                </div>
                <button type="button" onClick={resetCompany} className="text-xs font-medium text-[#006400] hover:underline">Change</button>
              </div>
            </div>
          ) : null}

          <div>
            <label htmlFor="research-question" className="mb-2 block text-sm font-semibold text-[#013220]">2. Ask your question</label>
            <textarea
              id="research-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              disabled={!verifiedCompany}
              maxLength={1000}
              className="min-h-28 w-full rounded-xl border border-[#d5e5d9] bg-white px-4 py-3 text-sm leading-6 text-[#013220] outline-none placeholder:text-[#7b8d82] focus:border-[#32CD32] focus:ring-2 focus:ring-[#32CD32]/15 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder={verifiedCompany ? `Ask anything about ${verifiedCompany.name}...` : "Verify a company above before asking"}
            />
            <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-xs text-[#5f7468]">Use verified evidence only. No investment recommendations.</p>
              {isAuthenticated ? (
                <button type="button" onClick={() => void askResearch()} disabled={!verifiedCompany || !question.trim() || isLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#32CD32] px-5 py-3 text-sm font-semibold text-[#013220] hover:bg-[#89F336] disabled:cursor-not-allowed disabled:opacity-60">
                  {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isLoading ? "Researching..." : "Ask WealthLens"}
                </button>
              ) : (
                <Link href="/login" className="inline-flex items-center justify-center rounded-xl bg-[#013220] px-5 py-3 text-sm font-semibold text-white hover:bg-[#075032]">Sign in to ask AI</Link>
              )}
            </div>
          </div>

          {error ? <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p> : null}
          {conversation.length > 0 ? (
            <div className="space-y-5" aria-live="polite">
              {conversation.map((turn, index) => (
                <div key={`${index}-${turn.question}`} className="space-y-3">
                  <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[#edf5ef] px-4 py-3 text-sm leading-6 text-[#013220] md:max-w-[78%]">{turn.question}</div>
                  <article className="rounded-2xl border border-[#dfeee3] bg-[#f8fff9] p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#013220]">
                      <Sparkles className="h-4 w-4 text-[#006400]" />
                      WealthLens
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-7 text-[#214b3d]">{turn.answer}</div>
                  </article>
                </div>
              ))}
            </div>
          ) : null}
          {verifiedContext ? (
            <details className="rounded-xl border border-[#dfeee3] bg-white p-4 text-sm text-[#214b3d]">
              <summary className="cursor-pointer font-semibold text-[#013220]">View verified sources used</summary>
              <p className="mt-3">
                Price: {verifiedContext.quote?.price ?? "unavailable"} · Change: {verifiedContext.quote?.percentChange == null ? "unavailable" : `${verifiedContext.quote.percentChange}%`}
              </p>
              {verifiedContext.news?.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  {verifiedContext.news.map((item, index) => <li key={`${index}-${item.headline}`}>{item.headline}</li>)}
                </ul>
              ) : null}
            </details>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
