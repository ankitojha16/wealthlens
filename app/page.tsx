import Link from "next/link";
import { ArrowRight, BarChart3, Search, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarketOverview } from "@/components/market/market-overview";
import { getMarketIndices, getNews } from "@/lib/market-api";

export default async function HomePage() {
  const indices = await getMarketIndices();
  const news = await getNews();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold tracking-[0.2em] text-slate-900 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-xs text-white dark:bg-slate-100 dark:text-slate-900">W</span>
            WEALTHLENS
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex dark:text-slate-300">
            <Link href="/markets">Markets</Link>
            <Link href="/company/TCS">Company</Link>
            <Link href="/news">News</Link>
            <Link href="/research">Research</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button className="border-0 bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900">Login</Button>
            </Link>
            <Link href="/markets">
              <Button>Explore Markets</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300">
              <Sparkles className="h-4 w-4" />
              Research Indian equities with clarity
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl dark:text-white">
              See the business behind the stock.
            </h1>

            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              WealthLens helps investors analyze Indian companies through verified market data, valuation metrics, historical performance, and contextual research.
            </p>

            <div className="mt-8 flex max-w-xl items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search company or symbol (TCS, Reliance, HDFC Bank)"
              />
              <Link href="/search">
                <Button className="bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900">Search</Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
              {[
                "TCS",
                "RELIANCE",
                "HDFCBANK",
                "INFY",
              ].map((symbol) => (
                <Link key={symbol} href={`/company/${symbol}`} className="rounded-full border border-slate-200 px-3 py-1.5 hover:border-slate-300 dark:border-slate-700">
                  {symbol}
                </Link>
              ))}
            </div>
          </div>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Market overview</p>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            {indices.length > 0 ? (
              <div className="space-y-4">
                {indices.slice(0, 4).map((index) => (
                  <div key={index.symbol} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <div>
                      <p className="font-medium">{index.symbol}</p>
                      <p className="text-xs text-slate-500">{index.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{index.value?.toLocaleString("en-IN") ?? "Data unavailable"}</p>
                      <p className={`text-xs ${Number(index.percentChange ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {index.percentChange === null ? "Data unavailable" : `${index.percentChange >= 0 ? "+" : ""}${index.percentChange.toFixed(2)}%`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Data unavailable</p>
            )}
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <MarketOverview indices={indices} />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Latest market news</h2>
          <Link href="/news" className="text-sm font-medium text-sky-700">View all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {news.length > 0 ? news.slice(0, 3).map((item) => (
            <Card key={item.id} className="flex h-full flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.symbol ?? "Market"}</p>
                <h3 className="mt-2 text-lg font-medium leading-relaxed">{item.headline}</h3>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                <span>{item.source}</span>
                <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Date unavailable"}</span>
              </div>
            </Card>
          )) : (
            <p className="text-sm text-slate-500">Data unavailable</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <BarChart3 className="mb-4 h-8 w-8 text-sky-600" />
            <h3 className="text-lg font-semibold">Market analytics</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Track valuation, operating metrics, and historical trend signals across Indian equities.</p>
          </Card>
          <Card>
            <TrendingUp className="mb-4 h-8 w-8 text-emerald-600" />
            <h3 className="text-lg font-semibold">Portfolio insights</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Compare holdings, sector weights, and risk using analytical reporting built for research.</p>
          </Card>
          <Card>
            <Search className="mb-4 h-8 w-8 text-violet-600" />
            <h3 className="text-lg font-semibold">AI research</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Ask contextual questions about revenue, leverage, recent developments, and peer comparisons.</p>
          </Card>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row dark:text-slate-300">
          <div>
            <p className="font-semibold tracking-[0.2em] text-slate-900 dark:text-white">WEALTHLENS</p>
            <p className="mt-2 max-w-lg">WealthLens is an educational and analytical platform. Market information may be delayed or provided on an end-of-day basis depending on the data provider.</p>
          </div>
          <Link href="/markets" className="inline-flex items-center gap-2 font-medium text-sky-700">
            Explore Markets <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
