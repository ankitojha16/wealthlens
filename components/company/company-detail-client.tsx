"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, BadgeInfo, BriefcaseBusiness, Building2, CircleDollarSign, FileText, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import type { CompanyResearch, HistoricalPoint, NewsItem, Quote } from "@/lib/types";

const tabLabels = ["Overview", "Financials", "Valuation", "Risk", "News", "Peers"] as const;
type TabKey = (typeof tabLabels)[number];

function formatCurrency(value: number | null, fallback = "—") {
  if (value === null || Number.isNaN(value)) return fallback;
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatMetric(value: string | number | null | undefined, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number") return Number.isNaN(value) ? fallback : value.toLocaleString("en-IN");
  return value;
}

function MissingValue({ label = "Not provided by current data source" }: { label?: string }) {
  return (
    <span title={label} className="inline-flex items-center text-[#1F2937]">
      —
    </span>
  );
}

export function CompanyDetailClient({
  company,
  quote,
  history,
  news,
}: {
  company: CompanyResearch;
  quote: Quote;
  history: HistoricalPoint[];
  news: NewsItem[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("Overview");
  const isPositive = Number(quote.percentChange ?? 0) >= 0;

  const overviewStats = useMemo(() => [
    ["Previous close", quote.previousClose !== null ? formatCurrency(quote.previousClose) : <MissingValue />],
    ["Current price", quote.price !== null ? formatCurrency(quote.price) : <MissingValue />],
    ["NSE code", company.nseCode ? formatMetric(company.nseCode) : <MissingValue />],
    ["BSE code", company.bseCode ? formatMetric(company.bseCode) : <MissingValue />],
    ["Data status", quote.status || <MissingValue />],
    ["Exchange", quote.exchange || <MissingValue />],
  ], [company.bseCode, company.nseCode, quote]);

  const financialStats = useMemo(() => [
    ["Market cap", company.marketCap !== null ? formatCurrency(company.marketCap) : <MissingValue />],
    ["Debt to equity", company.debtToEquity !== null ? company.debtToEquity.toFixed(2) : <MissingValue />],
    ["Dividend yield", company.dividendYield !== null ? `${company.dividendYield.toFixed(2)}%` : <MissingValue />],
    ["Net income", company.netIncome !== null ? formatCurrency(company.netIncome) : <MissingValue />],
    ["Average rating", company.averageRating ?? <MissingValue />],
    ["Sector P/E", company.sectorPe !== null ? company.sectorPe.toFixed(2) : <MissingValue />],
  ], [company]);

  const valuationStats = useMemo(() => [
    ["P/E", company.sectorPe !== null ? company.sectorPe.toFixed(2) : <MissingValue />],
    ["Market cap", company.marketCap !== null ? formatCurrency(company.marketCap) : <MissingValue />],
    ["Dividend yield", company.dividendYield !== null ? `${company.dividendYield.toFixed(2)}%` : <MissingValue />],
    ["Debt to equity", company.debtToEquity !== null ? company.debtToEquity.toFixed(2) : <MissingValue />],
    ["Net income", company.netIncome !== null ? formatCurrency(company.netIncome) : <MissingValue />],
    ["Analyst rating", company.averageRating ?? <MissingValue />],
  ], [company]);

  const riskStats = useMemo(() => [
    ["Debt to equity", company.debtToEquity !== null ? company.debtToEquity.toFixed(2) : null],
    ["Dividend yield", company.dividendYield !== null ? `${company.dividendYield.toFixed(2)}%` : null],
    ["Net income", company.netIncome !== null ? formatCurrency(company.netIncome) : null],
    ["Analyst rating", company.averageRating ?? null],
  ].filter(([, value]) => value !== null && value !== undefined && value !== ""), [company]);

  const hasFinancialData = [
    company.marketCap,
    company.debtToEquity,
    company.dividendYield,
    company.netIncome,
    company.averageRating,
    company.sectorPe,
  ].some((value) => value !== null && value !== undefined && value !== "");

  const hasValuationData = [
    company.sectorPe,
    company.marketCap,
    company.dividendYield,
    company.debtToEquity,
    company.netIncome,
    company.averageRating,
  ].some((value) => value !== null && value !== undefined && value !== "");

  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/markets" className="text-sm font-medium text-[#006400] hover:text-[#013220]">← Markets</Link>
      </div>

      <section className="rounded-3xl border border-[#32CD32]/20 bg-[#f4fff7] p-5 shadow-[0_18px_40px_rgba(1,50,32,0.08)] md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#4f665d]">{company.industry ?? "Industry unavailable"}</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#000000] md:text-4xl">{company.name}</h1>
            <p className="mt-2 text-sm font-medium text-[#1F2937]">{company.symbol || quote.symbol}</p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-3xl font-semibold text-[#000000] md:text-4xl">{quote.price !== null ? `₹${quote.price.toLocaleString("en-IN")}` : "Current price unavailable"}</p>
            <div className="mt-3 flex items-center justify-start gap-2 md:justify-end">
              <span className="inline-flex items-center rounded-full border border-[#dfeee3] bg-[#f7fff9] px-2.5 py-1 text-xs font-medium text-[#013220]">
                {quote.status || "Delayed"}
              </span>
              <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ${isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {quote.change === null || quote.percentChange === null ? "No change data" : `${quote.change.toFixed(2)} (${quote.percentChange.toFixed(2)}%)`}
              </div>
            </div>
            <p className="mt-2 text-xs text-[#1F2937]">Updated: {quote.updatedAt || "Market data"}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Open", quote.open !== null ? `₹${quote.open.toLocaleString("en-IN")}` : "—"],
          ["High", quote.high !== null ? `₹${quote.high.toLocaleString("en-IN")}` : "—"],
          ["Low", quote.low !== null ? `₹${quote.low.toLocaleString("en-IN")}` : "—"],
          ["Volume", quote.volume !== null ? quote.volume.toLocaleString("en-IN") : "—"],
        ].map(([label, value]) => (
          <Card key={String(label)} className="border-[#dfeee3] bg-white p-4 text-[#013220] shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#4f665d]">{label}</p>
            <p className="mt-3 text-xl font-semibold text-[#000000]" title={value === "—" ? "Not provided by current data source" : undefined}>{value}</p>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-[#dfeee3] bg-white p-5 text-[#013220] shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#006400]" />
            <h2 className="text-xl font-semibold text-[#013220]">Overview</h2>
          </div>
          <p className="text-[#214b3d] leading-7">{company.description ?? "Company description is not available from the current data provider."}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {overviewStats.map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-[#dfeee3] bg-[#f7fff9] p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#4f665d]">{label}</p>
                <p className="mt-2 text-base font-semibold text-[#013220]" title={typeof value === "string" && value === "—" ? "Not provided by current data source" : undefined}>{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-[#dfeee3] bg-white p-5 text-[#013220] shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#006400]" />
            <h2 className="text-xl font-semibold text-[#013220]">Research navigation</h2>
          </div>
          <div className="space-y-2 text-sm">
            {tabLabels.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left font-medium transition ${activeTab === tab ? "border-[#32CD32] bg-[#ebfff0] text-[#013220] shadow-sm" : "border-[#dfeee3] bg-[#f9fff9] text-[#013220] hover:border-[#32CD32]/40 hover:bg-[#f2fff5]"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-8">
        {activeTab === "Overview" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-[#dfeee3] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#006400]" />
                <h2 className="text-xl font-semibold text-[#013220]">Historical prices</h2>
              </div>
              <p className="text-sm text-[#4f665d]">{history.length > 0 ? `${history.length} daily observations available` : "Historical price data is unavailable."}</p>
              {history.length > 0 ? (() => {
                const latestClose = history.at(-1)?.close;
                return (
                  <p className="mt-3 text-sm text-[#013220]">
                    Latest close: {latestClose !== null && latestClose !== undefined ? `₹${latestClose.toLocaleString("en-IN")}` : "—"}
                  </p>
                );
              })() : null}
            </Card>

            <Card className="border-[#dfeee3] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BadgeInfo className="h-4 w-4 text-[#006400]" />
                <h2 className="text-xl font-semibold text-[#013220]">Company news</h2>
              </div>
              {news.length > 0 ? news.slice(0, 3).map((item) => (
                <a key={item.id} href={item.url || undefined} target={item.url ? "_blank" : undefined} rel={item.url ? "noreferrer" : undefined} className="block border-b border-[#ebf3ed] py-3 text-sm text-[#214b3d] last:border-b-0 hover:text-[#013220]">
                  {item.headline}
                </a>
              )) : <p className="text-sm text-[#214b3d]">No company news is currently available.</p>}
            </Card>
          </div>
        )}

        {activeTab === "Financials" && (
          <Card className="border-[#dfeee3] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-[#006400]" />
              <h2 className="text-xl font-semibold text-[#013220]">Financials</h2>
            </div>
            {hasFinancialData ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {financialStats.map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl border border-[#dfeee3] bg-[#f7fff9] p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#4f665d]">{label}</p>
                    <p className="mt-2 text-base font-semibold text-[#000000]" title={typeof value === "string" && value === "—" ? "Not provided by current data source" : undefined}>{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#32CD32]/25 bg-[#f7fff9] p-4 text-sm text-[#1F2937]">
                Data not available from current provider
              </div>
            )}
          </Card>
        )}

        {activeTab === "Valuation" && (
          <Card className="border-[#dfeee3] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4 text-[#006400]" />
              <h2 className="text-xl font-semibold text-[#013220]">Valuation</h2>
            </div>
            {hasValuationData ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {valuationStats.map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl border border-[#dfeee3] bg-[#f7fff9] p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#4f665d]">{label}</p>
                    <p className="mt-2 text-base font-semibold text-[#000000]" title={typeof value === "string" && value === "—" ? "Not provided by current data source" : undefined}>{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#32CD32]/25 bg-[#f7fff9] p-4 text-sm text-[#1F2937]">
                Data not available from current provider
              </div>
            )}
          </Card>
        )}

        {activeTab === "Risk" && (
          <Card className="border-[#dfeee3] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
              <h2 className="text-xl font-semibold text-[#013220]">Risk</h2>
            </div>
            {riskStats.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {riskStats.map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-[#dfeee3] bg-[#f7fff9] p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#4f665d]">{label}</p>
                    <p className="mt-2 text-base font-semibold text-[#013220]">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-red-200 bg-red-50/40 p-4 text-sm text-[#214b3d]">
                Risk data is not available from the current market-data provider.
              </div>
            )}
          </Card>
        )}

        {activeTab === "News" && (
          <Card className="border-[#dfeee3] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BadgeInfo className="h-4 w-4 text-[#006400]" />
              <h2 className="text-xl font-semibold text-[#013220]">Company news</h2>
            </div>
            {news.length > 0 ? news.map((item) => (
              <a key={item.id} href={item.url || undefined} target={item.url ? "_blank" : undefined} rel={item.url ? "noreferrer" : undefined} className="block border-b border-[#ebf3ed] py-3 text-sm text-[#214b3d] last:border-b-0 hover:text-[#013220]">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-[#4f665d]">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Date unavailable"}</span>
                {item.headline}
              </a>
            )) : <p className="text-sm text-[#214b3d]">No company news is currently available.</p>}
          </Card>
        )}

        {activeTab === "Peers" && (
          <Card className="border-[#dfeee3] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#006400]" />
              <h2 className="text-xl font-semibold text-[#013220]">Peers</h2>
            </div>
            {company.peerCompanies.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {company.peerCompanies.map((peer) => (
                  <div key={peer.symbol} className="rounded-xl border border-[#dfeee3] bg-[#f7fff9] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#013220]">{peer.symbol}</p>
                        <p className="text-xs text-[#4f665d]">{peer.name}</p>
                      </div>
                      <span className={`text-xs font-semibold ${peer.percentChange !== null && peer.percentChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {peer.percentChange === null ? "—" : `${peer.percentChange >= 0 ? "+" : ""}${peer.percentChange.toFixed(2)}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#32CD32]/20 bg-[#f7fff9] p-4 text-sm text-[#214b3d]">Peer data is not available from the current market-data provider.</div>
            )}
          </Card>
        )}
      </section>
    </main>
  );
}
