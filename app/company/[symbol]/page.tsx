import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, CircleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getCompanyBySymbol } from "@/lib/demo-data";

export default async function CompanyPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const company = getCompanyBySymbol(symbol);

  if (!company) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <CircleAlert className="h-5 w-5" />
          No verified data available for this symbol.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/markets" className="text-sm text-sky-700">← Markets</Link>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">{company.exchange}</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{company.sector}</p>
            <h1 className="mt-2 text-3xl font-semibold">{company.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{company.symbol} • {company.exchange}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-3xl font-semibold">₹{company.price.toLocaleString("en-IN")}</p>
            <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm ${company.percentChange >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {company.percentChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {company.change.toFixed(2)} ({company.percentChange.toFixed(2)}%)
            </div>
            <p className="mt-2 text-xs text-slate-500">Last updated: {new Date(company.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Market Cap", `₹${(company.marketCap / 1e9).toFixed(1)}B`],
          ["P/E", company.pe ? company.pe.toFixed(1) : "N/A"],
          ["ROE", company.roe ? `${company.roe.toFixed(1)}%` : "N/A"],
          ["Debt/Equity", company.debtToEquity ? company.debtToEquity.toFixed(2) : "N/A"],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
            <p className="mt-3 text-xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Overview</h2>
          <p className="text-slate-600 dark:text-slate-300">{company.description}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[ ["EPS", company.eps ? `₹${company.eps.toFixed(2)}` : "N/A"], ["Dividend Yield", company.dividendYield ? `${company.dividendYield.toFixed(2)}%` : "N/A"], ["Profit Margin", company.profitMargin ? `${company.profitMargin.toFixed(2)}%` : "N/A"], ["Revenue Growth", company.revenueGrowth ? `${company.revenueGrowth.toFixed(2)}%` : "N/A"] ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold">Research tabs</h2>
          <div className="space-y-3 text-sm">
            {['Overview', 'Chart', 'Financials', 'Valuation', 'Risk', 'News', 'Peers'].map((tab) => (
              <div key={tab} className="rounded-lg border border-slate-200 px-3 py-2">{tab}</div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
