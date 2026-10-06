import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Search, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { getMarketMovers, getNews } from "@/lib/market-api";
import { getSupabaseServerClient } from "@/lib/supabase-server";

function getPercentText(value: number | null) {
  if (value === null || Number.isNaN(value)) return "Data unavailable";
  const abs = Math.abs(value).toFixed(2);
  return value >= 0 ? `+${abs}%` : `-${abs}%`;
}

export default async function HomePage() {
  const [movers, news, { data: { user } }] = await Promise.all([
    getMarketMovers(),
    getNews(),
    (await getSupabaseServerClient()).auth.getUser(),
  ]);

  const dedupeBySymbol = (items: typeof movers.gainers) => {
    const unique = new Map<string, (typeof items)[number]>();
    for (const item of items) {
      const prev = unique.get(item.symbol);
      if (!prev || (item.percentChange ?? -Infinity) > (prev.percentChange ?? -Infinity)) {
        unique.set(item.symbol, item);
      }
    }
    return [...unique.values()];
  };

  const topGainers = dedupeBySymbol([...movers.gainers]).sort((a, b) => (b.percentChange ?? -Infinity) - (a.percentChange ?? -Infinity)).slice(0, 3);
  const topLosers = dedupeBySymbol([...movers.losers]).sort((a, b) => (a.percentChange ?? Infinity) - (b.percentChange ?? Infinity)).slice(0, 3);

  return (
    <main className="min-h-screen bg-transparent text-[#000000]">
      <header className="border-b border-[#0c4d2e]/10 bg-[#013220] text-white shadow-[0_10px_24px_rgba(1,50,32,0.08)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 font-semibold tracking-[0.2em] text-white">
            <Image src="/wealthlens-logo.svg" alt="WealthLens logo" width={32} height={32} className="h-8 w-8 rounded-md" />
            <span>WEALTHLENS</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-emerald-50/80 md:flex">
            <Link href="/markets" className="hover:text-white">Markets</Link>
            <Link href="/search" className="hover:text-white">Search</Link>
            <Link href="/news" className="hover:text-white">News</Link>
            <Link href="/research" className="hover:text-white">Research</Link>
          </nav>

          <div className="flex items-center gap-2">
            {user ? <LogoutButton /> : <Link href="/login"><Button className="border-0 bg-[#32CD32] text-[#013220] hover:bg-[#89F336]">Login</Button></Link>}
            <Link href="/markets"><Button className="border border-white/20 bg-white/5 text-white hover:bg-white/10">Explore Markets</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#32CD32]/30 bg-[#ebfff0] px-3 py-1.5 text-sm font-medium text-[#013220]">
              <Sparkles className="h-4 w-4 text-[#006400]" />
              Research Indian equities with clarity
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-[#000000] md:text-6xl">
              See the business behind the stock.
            </h1>

            <p className="mt-5 max-w-xl text-lg text-[#1F2937]">
              WealthLens helps investors analyze Indian companies through verified market data, valuation metrics, historical performance, and contextual research.
            </p>

            <form action="/search" method="get" className="mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-[#dfeee3] bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
              <Search className="h-5 w-5 text-[#006400]" />
              <input
                name="q"
                required
                className="w-full bg-transparent text-sm text-[#000000] outline-none placeholder:text-[#1F2937]"
                placeholder="Search company name or market leader"
              />
              <Button type="submit" className="bg-[#32CD32] text-[#013220] hover:bg-[#89F336]">Search</Button>
            </form>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#1F2937]">
              {['Top Indian companies', 'Portfolio watchlist', 'Research insights'].map((label) => (
                <span key={label} className="rounded-full border border-[#32CD32]/30 bg-white px-3 py-1.5 text-[#013220] shadow-sm">
                  {label}
                </span>
              ))}
            </div>
          </div>

          <Card className="border-[#32CD32]/20 bg-white p-6 text-[#000000] shadow-[0_18px_40px_rgba(1,50,32,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.2em] text-[#1F2937]">Market snapshot</p>
              <TrendingUp className="h-5 w-5 text-[#32CD32]" />
            </div>
            <div className="space-y-3">
              {topGainers.length > 0 ? topGainers.map((item) => (
                <Link key={item.symbol} href={`/company/${item.symbol}`} className="block rounded-2xl border border-[#dfeee3] bg-[#f4fff7] p-3 transition hover:border-[#32CD32]/50 hover:bg-[#ebfff0]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#013220]">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#000000]">₹{item.price?.toLocaleString("en-IN") ?? "Data unavailable"}</p>
                      <p className="text-xs font-medium text-emerald-600">{getPercentText(item.percentChange)}</p>
                    </div>
                  </div>
                </Link>
              )) : <p className="rounded-xl border border-dashed border-[#32CD32]/30 bg-[#f3fff4] p-4 text-sm text-[#1F2937]">Market movers are not currently available from the configured data source.</p>}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-[#dfeee3] bg-[#f7fff9] p-5 text-[#000000] shadow-[0_12px_30px_rgba(1,50,32,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#1F2937]">Top gainers</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#000000]">Bullish leaders</h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">+ve</span>
            </div>
            <div className="space-y-3">
              {topGainers.length > 0 ? topGainers.map((item) => (
                <Link key={item.symbol} href={`/company/${item.symbol}`} className="flex items-center justify-between rounded-xl border border-[#dfeee3] bg-white p-3 transition hover:border-[#32CD32]/50 hover:bg-emerald-50/50">
                  <div>
                    <p className="font-semibold text-[#013220]">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#000000]">₹{item.price?.toLocaleString("en-IN") ?? "Data unavailable"}</p>
                    <p className="text-xs font-semibold text-emerald-600">{getPercentText(item.percentChange)}</p>
                  </div>
                </Link>
              )) : <p className="text-sm text-[#1F2937]">Data unavailable</p>}
            </div>
          </Card>

          <Card className="border-[#f1d8d8] bg-[#fffaf9] p-5 text-[#000000] shadow-[0_12px_30px_rgba(153,27,27,0.05)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#1F2937]">Top losers</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#000000]">Weak momentum</h2>
              </div>
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">-ve</span>
            </div>
            <div className="space-y-3">
              {topLosers.length > 0 ? topLosers.map((item) => (
                <Link key={item.symbol} href={`/company/${item.symbol}`} className="flex items-center justify-between rounded-xl border border-[#f1d8d8] bg-white p-3 transition hover:border-red-300 hover:bg-red-50/60">
                  <div>
                    <p className="font-semibold text-[#013220]">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#000000]">₹{item.price?.toLocaleString("en-IN") ?? "Data unavailable"}</p>
                    <p className="text-xs font-semibold text-red-600">{getPercentText(item.percentChange)}</p>
                  </div>
                </Link>
              )) : <p className="text-sm text-[#1F2937]">Data unavailable</p>}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#013220]">Latest market news</h2>
          <Link href="/news" className="text-sm font-medium text-[#006400] hover:text-[#013220]">View all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {news.length > 0 ? news.slice(0, 3).map((item) => (
            <Card key={item.id} className="flex h-full flex-col justify-between border-[#dbeee0] bg-white p-5 text-[#000000] shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
              <div>
                <h3 className="text-lg font-medium leading-relaxed text-[#000000]">{item.headline}</h3>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-[#1F2937]">
                <span>{item.source ? item.source : "Market update"}</span>
                <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Date unavailable"}</span>
              </div>
            </Card>
          )) : (
            <p className="text-sm text-[#1F2937]">Data unavailable</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/markets" className="block">
            <Card className="h-full border-[#32CD32]/20 bg-white p-5 text-[#000000] transition hover:-translate-y-0.5 hover:border-[#32CD32]/50 hover:shadow-md">
              <BarChart3 className="mb-4 h-8 w-8 text-[#32CD32]" />
              <h3 className="text-lg font-semibold text-[#000000]">Market analytics</h3>
              <p className="mt-2 text-sm text-[#1F2937]">Track valuation, operating metrics, and historical trend signals across Indian equities.</p>
            </Card>
          </Link>
          <Link href="/portfolio" className="block">
            <Card className="h-full border-[#32CD32]/20 bg-white p-5 text-[#000000] transition hover:-translate-y-0.5 hover:border-[#32CD32]/50 hover:shadow-md">
              <TrendingUp className="mb-4 h-8 w-8 text-[#006400]" />
              <h3 className="text-lg font-semibold text-[#000000]">Portfolio insights</h3>
              <p className="mt-2 text-sm text-[#1F2937]">Compare holdings, sector weights, and risk using analytical reporting built for research.</p>
            </Card>
          </Link>
          <Link href="/research" className="block">
            <Card className="h-full border-[#32CD32]/20 bg-white p-5 text-[#000000] transition hover:-translate-y-0.5 hover:border-[#32CD32]/50 hover:shadow-md">
              <Search className="mb-4 h-8 w-8 text-[#006400]" />
              <h3 className="text-lg font-semibold text-[#000000]">AI research</h3>
              <p className="mt-2 text-sm text-[#1F2937]">Ask contextual questions about revenue, leverage, recent developments, and peer comparisons.</p>
            </Card>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#0c4d2e]/10 bg-[#013220] text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-emerald-50/80 md:flex-row">
          <div>
            <p className="font-semibold tracking-[0.2em] text-white">WEALTHLENS</p>
            <p className="mt-2 max-w-lg text-emerald-50/75">WealthLens is an educational and analytical platform. Market information may be delayed or provided on an end-of-day basis depending on the data provider.</p>
          </div>
          <Link href="/markets" className="inline-flex items-center gap-2 font-medium text-[#89F336]">
            Explore Markets <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
